import { type Request, type Response } from 'express';

import { getFormattedDatetimeUtcFromBlockTimestamp, getRangeFilter } from '../../../shared/helpers/datetime.js';
import { convertAmount } from '../../../shared/helpers/precision.js';
import { type PoolsCurrency, type TxActionRow, type TxActionsFilter } from '../../../shared/types';
import { respondWithServerError } from '../helpers/errors.js';
import { PoolsCurrencies } from '../models/PoolsCurrencies.js';
import { TxActions } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';

/**
 * TODO: Document what this is doing and why. Consider renaming.
 */
async function getDecimals(currency: string): Promise<PoolsCurrency> {
  const decimals = await PoolsCurrencies.findOne({ currency }).select('decimals');
  return decimals;
}

async function formatAmount(amount: number | string | undefined, currency: string | undefined): Promise<string> {
  return amount && currency ? await convertAmount(amount, currency, getDecimals) : '';
}

// eslint-disable-next-line max-lines-per-function, complexity
export const getTransactions = async (request: Request, response: Response) => {
  try {
    const { body } = request;
    const datetimeRangeFilter = getRangeFilter(body.startDate, body.endDate);
    console.log({ datetimeRangeFilter });
    let filter: TxActionsFilter = {
      accountId: body.accountId,
      block_timestamp: datetimeRangeFilter,
    };
    if (body.types.length > 0) {
      filter = { ...filter, txType: body.types };
    }

    const transactions: TxActionRow[] = await TxActions.find(filter).sort({ block_timestamp: -1 });
    const task = await TxTasks.findOne({ accountId: body.accountId }).select({ _id: 0 });

    const cleanedTransactions: TxActionRow[] = [];
    // eslint-disable-next-line array-callback-return
    for (const transaction of transactions) {
      /* eslint-disable canonical/sort-keys */
      cleanedTransactions.push({
        accountId: transaction.accountId ?? '',
        txType: transaction.txType ?? '',
        block_timestamp: Number(transaction.block_timestamp) ?? null, // backend/src/models/TxActions.js uses Decimal128 for this field, which React can't display. https://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-34-decimal.html
        block_timestamp_utc: transaction.block_timestamp ? getFormattedDatetimeUtcFromBlockTimestamp(transaction.block_timestamp) : '',
        from_account: transaction.from_account ?? '',
        block_height: transaction.block_height ?? null,
        args_base64: transaction.args_base64 ?? '',
        transaction_hash: transaction.transaction_hash ?? '',
        amount_transferred: await formatAmount(transaction.amount_transferred, transaction.currency_transferred),
        currency_transferred: transaction.currency_transferred ?? '',
        amount_transferred2: await formatAmount(transaction.amount_transferred2, transaction.currency_transferred2),
        currency_transferred2: transaction.currency_transferred2 ?? '',
        receiver_owner_account: transaction.receiver_owner_account ?? '',
        receiver_lockup_account: transaction.receiver_lockup_account ?? '',
        lockup_start: transaction.lockup_start ?? '',
        lockup_duration: transaction.lockup_duration ?? '',
        cliff_duration: transaction.cliff_duration ?? '',
        release_duration: transaction.release_duration ?? '',
      });
      /* eslint-enable canonical/sort-keys */
    }

    response.send({ lastUpdate: task ? task.lastUpdate : null, transactions: cleanedTransactions });
  } catch (error) {
    respondWithServerError(response, error);
  }
};
