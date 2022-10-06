import { performance } from 'perf_hooks';

import { type Request, type Response } from 'express';
import pg, { type Client } from 'pg';

import { getFormattedDatetimeUtcFromBlockTimestamp, getFormattedUtcDatetimeNow, millisToMinutesAndSeconds } from '../../../shared/helpers/datetime.js';
import { OK, SERVER_ERROR } from '../../../shared/helpers/statusCodes.js';
import { type AccountId, type TxActionRow, type TxTypeRow } from '../../../shared/types';
import { TxActions, getTxActionModel } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';
import { TxTypes } from '../models/TxTypes.js';

import { CONNECTION_STRING, DEFAULT_LENGTH, TIMEOUT } from './config.js';
import { getCurrencyByPool, getCurrencyByContract } from './getCurrency.js';

async function runThisTaskByAccountId(accountId: AccountId, types: TxTypeRow[]) {
  try {
    const txTask = await TxTasks.findOne({ accountId });
    if (txTask) {
      if (txTask.isRunning === false) {
        for (const type of types) {
          await updateTransactions(txTask.accountId, type.name, DEFAULT_LENGTH);
        }

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

export const runTaskForThisAccount = async (request: Request, response: Response) => {
  try {
    const types = await getAllTypes();
    await runThisTaskByAccountId(request.params.accountId, types);
    response.send(OK);
  } catch (error) {
    console.error(error);
    response.status(SERVER_ERROR).send({ error });
  }
};

export const runAllNonRunningTasks = async () => {
  const promisesOfAllTasks: Array<Promise<void>> = [];
  try {
    const [types, tasks] = await Promise.all([getAllTypes(), TxTasks.find({ isRunning: false })]);
    for (const task of tasks) {
      const promise = runThisTaskByAccountId(task.accountId, types);
      promisesOfAllTasks.push(promise);
    }
  } catch (error) {
    console.error(error);
  }

  return promisesOfAllTasks;
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
  return Number(mostRecentBlockTimestamp); // server/src/models/TxActions.js uses Decimal128 for this field, which React can't display. https://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-34-decimal.html
}

// eslint-disable-next-line max-lines-per-function
export async function updateTransactions(accountId: AccountId, txType: string, length: number) {
  // TODO: Make this function more efficient (see if we can parallelize the queries instead of using so many `await`s).
  // console.log(`updateTransactions(${accountId}, ${txType})`);
  const pgClient = new pg.Client({ connectionString: CONNECTION_STRING, statement_timeout: TIMEOUT });
  await pgClient.connect();
  // eslint-disable-next-line promise/valid-params
  await TxTasks.findOneAndUpdate(
    { accountId },
    {
      isRunning: true,
    },
  )
    .then()
    .catch((error: any) => console.error(error));
  let minBlockTimestamp = await getMostRecentBlockTimestamp(accountId, txType);
  //  console.log({ minBlockTimestamp });

  let transactions = await getTransactions(pgClient, accountId, txType, minBlockTimestamp, length);
  // console.log({ transactions });

  while (transactions.length > 0) {
    for (const transaction of transactions) {
      // console.log('Received: ', getFormattedDatetimeUtcFromBlockTimestamp(transaction.block_timestamp), transaction.transaction_hash);
      // eslint-disable-next-line canonical/id-match
      if (transaction.get_currency_by_contract) transaction.currency_transferred = await getCurrencyByContract(transaction.get_currency_by_contract);
      if (transaction.pool_id) [transaction.currency_transferred, transaction.currency_transferred2] = await getCurrencyByPool(Number(transaction.pool_id));
      // eslint-disable-next-line promise/valid-params
      await TxActions.findOneAndUpdate({ transaction_hash: transaction.transaction_hash, txType }, getTxActionModel(accountId, txType, transaction), { upsert: true })
        .then()
        .catch((error: any) => console.error(error));
    }

    let nextBlockTimestamp = transactions[transactions.length - 1].block_timestamp;
    let index = 1;
    while (nextBlockTimestamp === minBlockTimestamp && transactions.length === length * index) {
      index++;
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
  }

  await pgClient.end();
}
