import { performance } from 'perf_hooks';

import { type Request, type Response } from 'express';
import pg from 'pg';

import { getFormattedDatetimeUtcFromBlockTimestamp, millisToMinutesAndSeconds } from '../../../shared/helpers/datetime.js';
// import { logSuccess } from '../../../shared/helpers/logging.js';
import { OK, SERVER_ERROR } from '../../../shared/helpers/statusCodes.js';
import { type AccountId, type TxActionRow, type TxTypeRow } from '../../../shared/types';
import { TxActions, getTxActionModel } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';
import { TxTypes } from '../models/TxTypes.js';

import { CONNECTION_STRING, CONNECTION_TIMEOUT, DEFAULT_LENGTH, STATEMENT_TIMEOUT } from './config.js';
import { getCurrencyByPool, getCurrencyByContract } from './getCurrency.js';

// TODO: Delete this temporary function (and instead import from shared/helpers/logging) once the Jest config works.
function logSuccess(...args: any) {
  console.log(...args);
}

// eslint-disable-next-line max-lines-per-function
async function runThisTaskByAccountId(accountId: AccountId, types: TxTypeRow[]) {
  console.log('runThisTaskByAccountId', { accountId });
  try {
    const txTask = await TxTasks.findOne({ accountId });
    if (txTask) {
      console.log('found a task', txTask.id);
      if (txTask.isRunning === false) {
        console.log('isRunning === false');
        const promisesOfAllTasks: Array<Promise<void>> = [];
        console.log('pushing all updateTransactions.');
        for (const type of types) {
          const promise = updateTransactions(txTask.accountId, type.name, DEFAULT_LENGTH);
          promisesOfAllTasks.push(promise);
        }

        console.debug('Awaiting all updateTransactions promises.');
        await Promise.all(promisesOfAllTasks);
        logSuccess('Finished awaiting all updateTransactions promises.');
        try {
          await TxTasks.findOneAndUpdate(
            { accountId: txTask.accountId },
            {
              lastUpdate: Math.floor(Date.now()),
              isRunning: false,
            },
          );
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      throw new Error(`accountId '${accountId}' not found.`);
    }
  } catch (error) {
    console.error(error);
    throw new Error('Please try again.');
  }
}

async function getAllTypes(): Promise<TxTypeRow[]> {
  const types: TxTypeRow[] = await TxTypes.find({});
  return types;
}

export const runTaskForThisAccount = async (request: Request, response: Response): Promise<void> => {
  try {
    const types = await getAllTypes();
    const { accountId } = request.body;
    console.log('runTaskForThisAccount', { accountId });
    await runThisTaskByAccountId(accountId, types);
    response.send(OK);
  } catch (error) {
    console.error(error);
    response.status(SERVER_ERROR).send({ error });
  }
};

export const runAllNonRunningTasks = async (): Promise<void> => {
  const promisesOfAllTasks: Array<Promise<void>> = [];
  try {
    const [types, tasks] = await Promise.all([getAllTypes(), TxTasks.find({ isRunning: false })]);
    console.log(`types=${JSON.stringify(types.map((type) => type.name))}, tasks = ${JSON.stringify(tasks.map((task) => task.accountId))}`);
    console.log('pushing all runThisTaskByAccountId.');

    for (const task of tasks) {
      console.info('About to call runThisTaskByAccountId', task.accountId);
      const promise = runThisTaskByAccountId(task.accountId, types);
      promisesOfAllTasks.push(promise);
    }

    console.log('All promises have been started in runAllNonRunningTasks.');
  } catch (error) {
    console.error(error);
  }

  console.debug('Awaiting all runThisTaskByAccountId promises.');
  await Promise.all(promisesOfAllTasks);
  logSuccess('Finished awaiting all runThisTaskByAccountId promises.');
};

async function getTransactions(accountId: AccountId, txTypeName: string, blockTimestamp: number, length: number): Promise<TxActionRow[]> {
  try {
    const txType: TxTypeRow | null = await TxTypes.findOne({ name: txTypeName });
    if (txType) {
      const pgClient = new pg.Client({ connectionString: CONNECTION_STRING, statement_timeout: STATEMENT_TIMEOUT, connectionTimeoutMillis: CONNECTION_TIMEOUT });
      await pgClient.connect();
      console.info('pgClient connected');
      console.info(`getTransactions(${accountId}, ${txTypeName}, ${getFormattedDatetimeUtcFromBlockTimestamp(blockTimestamp)}, ${length})`);
      const startTime = performance.now();
      const result = await pgClient.query(txType.sql, [accountId, blockTimestamp.toString(), length]);
      const endTime = performance.now();
      console.info(millisToMinutesAndSeconds(endTime - startTime), 'pgClient performance of getTransactions');
      const rows = result.rows as unknown as TxActionRow[];
      // console.log(JSON.stringify(rows));
      await pgClient.end();
      return rows;
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getMostRecentBlockTimestamp(accountId: AccountId, txType: string): Promise<number> {
  const mostRecentTxAction = await TxActions.findOne({
    accountId,
    txType,
  }).sort({ block_timestamp: 'desc' });
  const mostRecentBlockTimestamp = mostRecentTxAction ? mostRecentTxAction.block_timestamp : 0;
  // console.log(`getMostRecentBlockTimestamp(${accountId}, ${txType})`, mostRecentBlockTimestamp);
  return Number(mostRecentBlockTimestamp); // backend/src/models/TxActions.js uses Decimal128 for this field, which React can't display. https://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-34-decimal.html
}

async function processTransaction(accountId: AccountId, txType: string, transaction: TxActionRow): Promise<void> {
  console.log('processTransaction: ', accountId, transaction.transaction_hash, getFormattedDatetimeUtcFromBlockTimestamp(transaction.block_timestamp));
  const clonedTransaction = { ...transaction };
  if (clonedTransaction.get_currency_by_contract) {
    console.log('fungibleTokenContractAccountId', clonedTransaction.get_currency_by_contract);

    // eslint-disable-next-line canonical/id-match
    clonedTransaction.currency_transferred = await getCurrencyByContract(clonedTransaction.get_currency_by_contract);
  }

  if (clonedTransaction.pool_id) {
    [clonedTransaction.currency_transferred, clonedTransaction.currency_transferred2] = await getCurrencyByPool(Number(clonedTransaction.pool_id));
  }

  try {
    await TxActions.findOneAndUpdate({ transaction_hash: clonedTransaction.transaction_hash, txType }, getTxActionModel(accountId, txType, clonedTransaction), { upsert: true });
  } catch (error) {
    console.error(error);
  }
}

// eslint-disable-next-line max-lines-per-function
export async function updateTransactions(accountId: AccountId, txType: string, length: number): Promise<void> {
  console.log(`updateTransactions(${accountId}, ${txType})`);
  // eslint-disable-next-line promise/valid-params
  await TxTasks.findOneAndUpdate(
    { accountId },
    {
      isRunning: true,
    },
  );
  let minBlockTimestamp = await getMostRecentBlockTimestamp(accountId, txType);
  //  console.log({ minBlockTimestamp });

  console.debug('Awaiting getTransactions', accountId, txType);
  let transactions = await getTransactions(accountId, txType, minBlockTimestamp, length);
  // console.log({ transactions });
  console.log(`Starting the 'while' loop of updateTransactions ${txType}`);
  while (transactions.length > 0) {
    const promises: Array<Promise<void>> = [];
    console.log('Pushing all processTransaction promises.');
    console.group();
    for (const transaction of transactions) {
      console.log('About to call processTransaction', transaction.transaction_hash);
      const promise = processTransaction(accountId, txType, transaction);
      promises.push(promise);
    }

    console.groupEnd();
    logSuccess('Finished the `for` loop of pushing processTransaction promises (but not the `while` loop).');
    await Promise.all(promises);
    logSuccess('Finished awaiting all promises (but still in the `while` loop).');
    // -------------------------------------------------
    // TODO: Document what is happening in this section:
    let nextBlockTimestamp = transactions[transactions.length - 1].block_timestamp;
    let index = 1;
    while (nextBlockTimestamp === minBlockTimestamp && transactions.length === length * index) {
      index += 1;
      const increasedLength = length * index;
      transactions = await getTransactions(accountId, txType, minBlockTimestamp, increasedLength);
      nextBlockTimestamp = transactions[transactions.length - 1].block_timestamp;
    }

    if (nextBlockTimestamp === minBlockTimestamp) {
      break;
    }

    if (index === 1) {
      minBlockTimestamp = nextBlockTimestamp;
      transactions = await getTransactions(accountId, txType, minBlockTimestamp, length);
    }
    // -------------------------------------------------
  }

  logSuccess(`Finished the 'while' loop of updateTransactions ${txType}`);
}
