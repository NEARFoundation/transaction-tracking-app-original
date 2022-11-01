/* eslint no-use-before-define: "error"*/
import { performance } from 'perf_hooks';

import { type Request, type Response } from 'express';
import pg, { type Client } from 'pg';

import { getFormattedDatetimeUtcFromBlockTimestamp, millisToMinutesAndSeconds } from '../../../shared/helpers/datetime.js';
import { logger } from '../../../shared/helpers/logging.js';
import { OK, SERVER_ERROR } from '../../../shared/helpers/statusCodes.js';
import { type AccountId, type TxActionRow, type TxTypeRow } from '../../../shared/types';
import { TxActions, getTxActionModel } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';
import { TxTypes } from '../models/TxTypes.js';

import { CONNECTION_STRING, CONNECTION_TIMEOUT, DEFAULT_LENGTH, STATEMENT_TIMEOUT } from './config.js';
import { getCurrencyByPool, getCurrencyByContract } from './getCurrency.js';

/**
 * For this particular accountId, sorts all transactions of this type by their block timestamp and returns the most recent one (or zero if none found).
 * This is useful for filtering indexer queries to exclude transactions that have already been saved to the cache.
 */
async function getMostRecentBlockTimestamp(accountId: AccountId, txType: string): Promise<number> {
  const mostRecentTxAction = await TxActions.findOne({
    accountId,
    txType,
  }).sort({ block_timestamp: 'desc' });
  const mostRecentBlockTimestamp = mostRecentTxAction ? mostRecentTxAction.block_timestamp : 0;
  // logger.info(`getMostRecentBlockTimestamp(${accountId}, ${txType})`, mostRecentBlockTimestamp);
  return Number(mostRecentBlockTimestamp); // backend/src/models/TxActions.js uses Decimal128 for this field, which React can't display. https://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-34-decimal.html
}

/**
 * Run the SQL query of this transaction type to check whether the indexer has any transactions of this
 * type for this accountId (in the period defined by blockTimestamp and length).
 */
async function getTransactionsFromIndexer(pgClient: Client, accountId: AccountId, txTypeName: string, blockTimestamp: number, length: number): Promise<TxActionRow[]> {
  try {
    const txType: TxTypeRow | null = await TxTypes.findOne({ name: txTypeName });
    if (txType) {
      logger.info(accountId, `getTransactionsFromIndexer(${accountId}, ${txTypeName}, ${getFormattedDatetimeUtcFromBlockTimestamp(blockTimestamp)}, ${length})`);
      const startTime = performance.now();
      const result = await pgClient.query(txType.sql, [accountId, blockTimestamp.toString(), length]);
      const endTime = performance.now();
      logger.info(
        accountId,
        `pgClient performance of getTransactionsFromIndexer(${accountId}, ${txTypeName}, ${getFormattedDatetimeUtcFromBlockTimestamp(blockTimestamp)}, ${length})`,
        millisToMinutesAndSeconds(endTime - startTime),
      );
      const rows = result.rows as unknown as TxActionRow[];
      logger.info(accountId, `${txTypeName} rows`, JSON.stringify(rows));
      return rows;
    } else {
      return [];
    }
  } catch (error) {
    logger.error(error);
    return [];
  }
}

/**
 * Having found a relevant transaction on the Postgres indexer, this function saves it to the Mongo cache (doing extra currency processing as necessary).
 */
async function saveTransactionFromIndexerToCache(accountId: AccountId, txType: string, transaction: TxActionRow): Promise<void> {
  logger.info(accountId, 'saveTransactionFromIndexerToCache: ', accountId, transaction.transaction_hash, getFormattedDatetimeUtcFromBlockTimestamp(transaction.block_timestamp));
  const clonedTransaction = { ...transaction };
  if (clonedTransaction.get_currency_by_contract) {
    logger.info(accountId, 'fungibleTokenContractAccountId', clonedTransaction.get_currency_by_contract);

    // eslint-disable-next-line canonical/id-match
    clonedTransaction.currency_transferred = await getCurrencyByContract(clonedTransaction.get_currency_by_contract);
  }

  if (clonedTransaction.pool_id) {
    [clonedTransaction.currency_transferred, clonedTransaction.currency_transferred2] = await getCurrencyByPool(Number(clonedTransaction.pool_id));
  }

  try {
    await TxActions.findOneAndUpdate({ transaction_hash: clonedTransaction.transaction_hash, txType }, getTxActionModel(accountId, txType, clonedTransaction), { upsert: true });
    logger.info(accountId, `Saved to Mongo cache (TxActions): ${accountId} ${clonedTransaction.transaction_hash}`);
  } catch (error) {
    logger.error(error);
  }
}

// eslint-disable-next-line max-lines-per-function
export async function updateTransactions(pgClient: pg.Client, accountId: AccountId, txType: string, length: number): Promise<void> {
  logger.info(accountId, `updateTransactions(${accountId}, ${txType})`);

  let minBlockTimestamp = await getMostRecentBlockTimestamp(accountId, txType);
  //  logger.info({ minBlockTimestamp });

  logger.debug(accountId, 'Awaiting getTransactions', accountId, txType);
  let transactions = await getTransactionsFromIndexer(pgClient, accountId, txType, minBlockTimestamp, length);
  // logger.info({ transactions });
  logger.info(accountId, `Starting the 'while' loop of updateTransactions ${txType}`);
  while (transactions.length > 0) {
    const promises: Array<Promise<void>> = [];
    logger.info(accountId, `Pushing all saveTransactionFromIndexerToCache promises for ${accountId} ${txType}.`);

    for (const transaction of transactions) {
      logger.info(accountId, 'About to call saveTransactionFromIndexerToCache', transaction.transaction_hash);
      const promise = saveTransactionFromIndexerToCache(accountId, txType, transaction);
      promises.push(promise);
    }

    // logger.success('Finished the `for` loop of pushing saveTransactionFromIndexerToCache promises (but not the `while` loop).');
    logger.debug(accountId, `Awaiting all updateTransactions promises for ${accountId} ${txType}.`);
    await Promise.all(promises);
    logger.success(accountId, `Finished awaiting all promises (but still in the 'while' loop) for ${accountId} ${txType}.`);
    // -------------------------------------------------
    // TODO: Document what is happening in this section:
    let nextBlockTimestamp = transactions[transactions.length - 1].block_timestamp;
    let index = 1;
    while (nextBlockTimestamp === minBlockTimestamp && transactions.length === length * index) {
      index += 1;
      const increasedLength = length * index;
      transactions = await getTransactionsFromIndexer(pgClient, accountId, txType, minBlockTimestamp, increasedLength);
      nextBlockTimestamp = transactions[transactions.length - 1].block_timestamp;
    }

    if (nextBlockTimestamp === minBlockTimestamp) {
      break;
    }

    if (index === 1) {
      minBlockTimestamp = nextBlockTimestamp;
      transactions = await getTransactionsFromIndexer(pgClient, accountId, txType, minBlockTimestamp, length);
    }
    // -------------------------------------------------
  }

  logger.success(accountId, `Finished the 'while' loop of updateTransactions ${accountId} ${txType}`);
}

/**
 * Run the SQL query for each of these transaction types to find any matching transactions on the indexer that the cache doesn't already have.
 * This is the only app function that uses the pg connection.
 */
async function fetchTransactionsForTheseTypes(accountId: AccountId, types: TxTypeRow[]): Promise<void> {
  const pgClient = new pg.Client({ connectionString: CONNECTION_STRING, statement_timeout: STATEMENT_TIMEOUT, connectionTimeoutMillis: CONNECTION_TIMEOUT });
  await pgClient.connect();
  // logger.info('pgClient connected');
  const promisesOfAllTasks: Array<Promise<void>> = [];
  logger.info(accountId, 'pushing all updateTransactions.');
  for (const type of types) {
    const promise = updateTransactions(pgClient, accountId, type.name, DEFAULT_LENGTH);
    promisesOfAllTasks.push(promise);
  }

  logger.debug(accountId, `Awaiting all updateTransactions promises for ${accountId}.`);
  await Promise.all(promisesOfAllTasks);
  logger.success(accountId, `Finished awaiting all updateTransactions promises for ${accountId}.`);
  await pgClient.end();
}

/**
 *
 * For this accountId, call updateTransactions for each of the provided transaction types. When they've all finished, mark this account as updated.
 */
// eslint-disable-next-line max-lines-per-function
async function updateThisAccount(accountId: AccountId, types: TxTypeRow[]): Promise<void> {
  logger.info(accountId, 'inside updateThisAccount');
  try {
    const txTask = await TxTasks.findOne({ accountId });
    if (txTask) {
      // logger.info('found a task', txTask.id);
      if (txTask.isRunning === false) {
        // logger.info('isRunning === false');
        await TxTasks.findOneAndUpdate(
          { accountId },
          {
            isRunning: true,
          },
        );
        await fetchTransactionsForTheseTypes(accountId, types);
        try {
          await TxTasks.findOneAndUpdate(
            { accountId: txTask.accountId },
            {
              lastUpdate: Math.floor(Date.now()),
              isRunning: false,
            },
          );
        } catch (error) {
          logger.error(error);
        }
      }
    } else {
      throw new Error(`accountId '${accountId}' not found.`);
    }
  } catch (error) {
    logger.error(error);
    throw new Error('Please try again.');
  }
}

/**
 *
 * During server startup, a folder of SQL queries gets read and saved into the Mongo cache, defining the various transaction types.
 * These transaction types should be mutually exclusive and collectively exhaustive.
 */
async function getAllTypes(): Promise<TxTypeRow[]> {
  const types: TxTypeRow[] = await TxTypes.find({});
  return types;
}

/**
 *
 * Simple API endpoint for calling updateThisAccount via  accountId parameter.
 */
export const runTaskForThisAccount = async (request: Request, response: Response): Promise<void> => {
  try {
    const types = await getAllTypes();
    const { accountId } = request.body;
    logger.info('updateThisAccount', { accountId });
    await updateThisAccount(accountId, types);
    response.send(OK);
  } catch (error) {
    logger.error(error);
    response.status(SERVER_ERROR).send({ error });
  }
};

/**
 * The cron job periodically calls this function, which calls updateThisAccount for any account that isn't already running from a previous call.
 */
export const runAllNonRunningTasks = async (): Promise<string[]> => {
  const promisesOfAllTasks: Array<Promise<void>> = [];
  const accountsStillRunning: string[] = [];
  try {
    const [types, tasks] = await Promise.all([getAllTypes(), TxTasks.find({})]);
    logger.info(
      `types`,
      types.map((type) => type.name),
    );
    logger.info(
      `tasks`,
      tasks.map((task) => task.accountId),
    );

    for (const task of tasks) {
      if (task.isRunning) {
        accountsStillRunning.push(task.accountId);
      } else {
        logger.info(task.accountId, 'pushing updateThisAccount');
        const promise = updateThisAccount(task.accountId, types);
        promisesOfAllTasks.push(promise);
      }
    }

    // logger.info('All promises have been started in runAllNonRunningTasks.');
  } catch (error) {
    logger.error(error);
  }

  // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
  accountsStillRunning.sort();
  // logger.debug('Awaiting all runThisTaskByAccountId promises.');
  await Promise.all(promisesOfAllTasks);
  logger.success('Finished awaiting all runThisTaskByAccountId promises.', { accountsStillRunning });
  return accountsStillRunning;
};
