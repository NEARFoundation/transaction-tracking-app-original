import { performance } from 'perf_hooks';

import { type Request, type Response } from 'express';
import pg, { type Client } from 'pg';

import { getFormattedDatetimeUtcFromBlockTimestamp, getFormattedUtcDatetimeNow, millisToMinutesAndSeconds } from '../../../shared/helpers/datetime.js';
import { OK, SERVER_ERROR } from '../../../shared/helpers/statusCodes.js';
import { type AccountId, type TxActionRow, type TxTypeRow } from '../../../shared/types';
import { TxActions, getTxActionModel } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';
import { TxTypes } from '../models/TxTypes.js';

import { CONNECTION_STRING, CONNECTION_TIMEOUT, DEFAULT_LENGTH, STATEMENT_TIMEOUT } from './config.js';
import { getCurrencyByPool, getCurrencyByContract } from './getCurrency.js';

// eslint-disable-next-line max-lines-per-function
async function runThisTaskByAccountId(accountId: AccountId, types: TxTypeRow[]) {
  console.log('runThisTaskByAccountId', { accountId });
  try {
    const txTask = await TxTasks.findOne({ accountId });
    if (txTask) {
      console.log('found a task', txTask.id);
      if (txTask.isRunning === false) {
        console.log('isRunning === false');
        const pgClient = new pg.Client({ connectionString: CONNECTION_STRING, statement_timeout: STATEMENT_TIMEOUT, connectionTimeoutMillis: CONNECTION_TIMEOUT });
        await pgClient.connect();
        console.log('pgClient connected');
        const promisesOfAllTasks: Array<Promise<void>> = [];
        for (const type of types) {
          const promise = updateTransactions(pgClient, txTask.accountId, type.name, DEFAULT_LENGTH);
          promisesOfAllTasks.push(promise);
        }

        console.log('now awaiting the resolution of each updateTransactions promise.');
        await Promise.all(promisesOfAllTasks);
        console.log('All updateTransactions promises resolved.');
        await pgClient.end();
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
    for (const task of tasks) {
      console.log('About to call runThisTaskByAccountId', task.accountId);
      const promise = runThisTaskByAccountId(task.accountId, types);
      promisesOfAllTasks.push(promise);
    }

    console.log('All promises have been started in runAllNonRunningTasks.');
  } catch (error) {
    console.error(error);
  }

  await Promise.all(promisesOfAllTasks);
};

async function getTransactions(pgClient: Client, accountId: AccountId, txTypeName: string, blockTimestamp: number, length: number): Promise<TxActionRow[]> {
  try {
    const txType: TxTypeRow | null = await TxTypes.findOne({ name: txTypeName });
    if (txType) {
      // console.log(getFormattedUtcDatetimeNow(), `getTransactions(${accountId}, ${txTypeName}, ${getFormattedDatetimeUtcFromBlockTimestamp(blockTimestamp)}, ${length})`);
      const startTime = performance.now();
      const result = await pgClient.query(txType.sql, [accountId, blockTimestamp.toString(), length]);
      const endTime = performance.now();
      // console.log(millisToMinutesAndSeconds(endTime - startTime), 'pgClient performance of getTransactions');
      const rows = result.rows as unknown as TxActionRow[];
      // console.log(JSON.stringify(rows));
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
  console.log(getFormattedDatetimeUtcFromBlockTimestamp(transaction.block_timestamp), 'processTransaction: ', accountId, transaction.transaction_hash);
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
export async function updateTransactions(pgClient: pg.Client, accountId: AccountId, txType: string, length: number): Promise<void> {
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

  let transactions = await getTransactions(pgClient, accountId, txType, minBlockTimestamp, length);
  // console.log({ transactions });
  console.log({ accountId }, transactions.length);

  while (transactions.length > 0) {
    const promises: Array<Promise<void>> = [];
    for (const transaction of transactions) {
      const promise = processTransaction(accountId, txType, transaction);
      promises.push(promise);
    }

    await Promise.all(promises);
    // -------------------------------------------------
    // TODO: Document what is happening in this section:
    let nextBlockTimestamp = transactions[transactions.length - 1].block_timestamp;
    let index = 1;
    while (nextBlockTimestamp === minBlockTimestamp && transactions.length === length * index) {
      index += 1;
      const increasedLength = length * index;
      transactions = await getTransactions(pgClient, accountId, txType, minBlockTimestamp, increasedLength);
      nextBlockTimestamp = transactions[transactions.length - 1].block_timestamp;
    }

    if (nextBlockTimestamp === minBlockTimestamp) {
      break;
    }

    if (index === 1) {
      minBlockTimestamp = nextBlockTimestamp;
      transactions = await getTransactions(pgClient, accountId, txType, minBlockTimestamp, length);
    }
    // -------------------------------------------------
  }
}
