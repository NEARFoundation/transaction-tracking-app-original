import { performance } from 'perf_hooks';

import { type Request, type Response } from 'express';
import pg, { type Client } from 'pg';

import { getFormattedDatetimeUtcFromBlockTimestamp, getFormattedUtcDatetimeNow, millisToMinutesAndSeconds } from '../../../shared/helpers/datetime.js';
import { OK, SERVER_ERROR } from '../../../shared/helpers/statusCodes.js';
import { type AccountId, type TxActionRow, type TxTypeRow } from '../../../shared/types';
import { TxActions } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';
import { TxTypes } from '../models/TxTypes.js';

import { CONNECTION_STRING, DEFAULT_LENGTH, TIMEOUT } from './config.js';
import { getCurrencyByPool, getCurrencyByContract } from './getCurrency.js';

let isAlreadyRunning = 0;

export const runTaskForThisAccount = async (request: Request, response: Response) => {
  // TODO: See whether we can reduce duplication with `runAllNonRunningTasks`.
  try {
    const account = await TxTasks.findOne({ accountId: request.body.accountId });
    if (account) {
      response.send(OK);
      if (account.isRunning === false) {
        const types: TxTypeRow[] = await TxTypes.find({});
        for (const type of types) {
          await updateTransactions(account.accountId, type.name, DEFAULT_LENGTH);
        }

        try {
          await TxTasks.findOneAndUpdate(
            { accountId: account.accountId },
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
      response.status(SERVER_ERROR).send({ error: 'accountId not found' });
    }
  } catch (error) {
    console.error(error);
    response.status(SERVER_ERROR).send({ error: 'Please try again' });
  }
};

// eslint-disable-next-line max-lines-per-function
export const runAllNonRunningTasks = async () => {
  if (isAlreadyRunning === 0) {
    try {
      isAlreadyRunning = 1;
      console.log('runAllNonRunningTasks() isAlreadyRunning', getFormattedUtcDatetimeNow());
      const types: TxTypeRow[] = await TxTypes.find({});
      const tasks = await TxTasks.find({ isRunning: false });
      for (const task of tasks) {
        for (const type of types) {
          await updateTransactions(task.accountId, type.name, DEFAULT_LENGTH);
        }

        try {
          // eslint-disable-next-line promise/valid-params
          await TxTasks.findOneAndUpdate(
            { accountId: task.accountId },
            {
              lastUpdate: Math.floor(Date.now()),
              isRunning: false,
            },
          );
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }

    isAlreadyRunning = 0;
  } else {
    console.log('SyncedCron: runAllNonRunningTasks is already running.');
  }
};

async function getTransactions(pgClient: Client, accountId: AccountId, txTypeName: string, blockTimestamp: number, length: number): Promise<TxActionRow[]> {
  try {
    const txType: TxTypeRow | null = await TxTypes.findOne({ name: txTypeName });
    if (txType) {
      console.log(getFormattedUtcDatetimeNow(), `getTransactions(${accountId}, ${txTypeName}, ${getFormattedDatetimeUtcFromBlockTimestamp(blockTimestamp)}, ${length})`);
      const startTime = performance.now();
      const result = await pgClient.query(txType.sql, [accountId, blockTimestamp.toString(), length]);
      const endTime = performance.now();
      console.log(millisToMinutesAndSeconds(endTime - startTime));
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
  console.log(`updateTransactions(${accountId}, ${txType})`);
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
  console.log({ minBlockTimestamp });

  let transactions = await getTransactions(pgClient, accountId, txType, minBlockTimestamp, length);
  // console.log({ transactions });

  while (transactions.length > 0) {
    for (const item of transactions) {
      console.log('Received: ', item.block_timestamp, item.transaction_hash);
      // eslint-disable-next-line canonical/id-match
      if (item.get_currency_by_contract) item.currency_transferred = await getCurrencyByContract(item.get_currency_by_contract);
      if (item.pool_id) [item.currency_transferred, item.currency_transferred2] = await getCurrencyByPool(Number(item.pool_id));
      // eslint-disable-next-line promise/valid-params
      await TxActions.findOneAndUpdate(
        { transaction_hash: item.transaction_hash, txType },
        {
          accountId,
          txType,
          block_timestamp: item.block_timestamp,
          from_account: item.from_account,
          block_height: item.block_height,
          args_base64: item.args_base64,
          transaction_hash: item.transaction_hash,
          amount_transferred: item.amount_transferred,
          currency_transferred: item.currency_transferred,
          amount_transferred2: item.amount_transferred2,
          currency_transferred2: item.currency_transferred2,
          receiver_owner_account: item.receiver_owner_account,
          receiver_lockup_account: item.receiver_lockup_account,
          lockup_start: item.lockup_start,
          lockup_duration: item.lockup_duration,
          cliff_duration: item.cliff_duration,
          release_duration: item.release_duration,
        },
        { upsert: true },
      )
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
