import pg from 'pg';
import { TxActions } from '../models/TxActions.js';
import { TxTypes } from '../models/TxTypes.js';
import { TxTasks } from '../models/TxTasks.js';
import { getCurrencyByPool, getCurrencyByContract } from './getCurrency.js';
import { AccountId } from '../../../shared/types';

const pgClient = new pg.Client({ connectionString: process.env.POSTGRESQL_CONNECTION_STRING });
await pgClient.connect();

let IsRun = 0;

export const runTasks = async () => {
  if (IsRun === 0) {
    try {
      IsRun = 1;
      let types = await TxTypes.find({});
      let tasks = await TxTasks.find({});
      for (const task of tasks) {
        for (const type of types) {
          await updateTransactions(task.accountId, type.name);
        }
        await TxTasks.findOneAndUpdate(
          { accountId: task.accountId },
          {
            lastUpdate: Math.floor(Date.now()),
            isRunning: false,
          },
        )
          .then()
          .catch((error) => console.error(error));
      }
    } catch (error) {
      console.error(error);
    }
    IsRun = 0;
  } else {
    console.log('SyncedCron: runTasks is already running');
  }
};

async function getTransactions(accountId: AccountId, txType, block_timestamp, length) {
  try {
    let TxType = await TxTypes.findOne({ name: txType });
    if (TxType) {
      console.log(`getTransactions(${accountId}, ${txType}, ${block_timestamp.toString()}, ${length})`);
      const res = await pgClient.query(TxType.sql, [accountId, block_timestamp.toString(), length]);
      return res.rows;
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function updateTransactions(accountId: AccountId, txType) {
  console.log(`updateTransactions(${accountId}, ${txType})`);
  await TxTasks.findOneAndUpdate(
    { accountId: accountId },
    {
      isRunning: true,
    },
  )
    .then()
    .catch((error) => console.error(error));
  let blockTimestamp = 0;
  const length = 100;
  const lastBlockTimestamp = await TxActions.findOne({
    accountId: accountId,
    txType: txType,
  }).sort([['block_timestamp', -1]]);
  if (lastBlockTimestamp) blockTimestamp = lastBlockTimestamp.block_timestamp;
  let transactions: any = await getTransactions(accountId, txType, blockTimestamp, length);

  while (transactions.length > 0) {
    transactions.map(async (item: any) => {
      console.log('Received: ', item.block_timestamp);
      if (item.pool_id) item.currency_transferred2 = await getCurrencyByPool(parseInt(item.pool_id));
      if (item.get_currency_by_contract) item.currency_transferred = await getCurrencyByContract(item.get_currency_by_contract);
      await TxActions.findOneAndUpdate(
        { transaction_hash: item.transaction_hash, txType: txType },
        {
          accountId: accountId,
          txType: txType,
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
        },
        { upsert: true },
      )
        .then()
        .catch((error) => console.error(error));
    });

    let nextBlockTimestamp = transactions[transactions.length - 1].block_timestamp;
    let i = 1;
    while (nextBlockTimestamp === blockTimestamp && transactions.length === length * i) {
      i++;
      let increasedLength = length * i;
      transactions = await getTransactions(accountId, txType, blockTimestamp, increasedLength);
      nextBlockTimestamp = transactions[transactions.length - 1].block_timestamp;
    }
    if (nextBlockTimestamp === blockTimestamp) {
      break;
    }
    if (i === 1) {
      blockTimestamp = nextBlockTimestamp;
      transactions = await getTransactions(accountId, txType, blockTimestamp, length);
    }
  }
}
