import { Decimal } from 'decimal.js';

import { getFormattedDatetimeUtcFromBlockTimestamp, getRangeFilter } from '../../../shared/helpers/datetime.js';
import { type TxActionRow, type TxActionsFilter } from '../../../shared/types';
import { respondWithServerError } from '../helpers/errors.js';
import { PoolsCurrencies } from '../models/PoolsCurrencies.js';
import { TxActions } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';

/**
 * TODO: Document what this is doing and why. Also consider moving it to the precision helper file.
 *
 * @param {number | string} amount
 * @param {string} currency
 * @returns {string}
 */
async function convertAmount(amount: number | string, currency: string): Promise<string> {
  if (currency === 'NEAR' || currency === 'wNEAR')
    return new Decimal(amount)
      .div(new Decimal(10 ** 24))
      .toDecimalPlaces(10)
      .toString();
  const decimals = await PoolsCurrencies.findOne({ currency }).select('decimals');
  if (decimals?.decimals)
    return new Decimal(amount)
      .div(new Decimal(10 ** decimals.decimals))
      .toDecimalPlaces(10)
      .toString();
  else
    return new Decimal(amount)
      .div(new Decimal(10 ** 24))
      .toDecimalPlaces(10)
      .toString();
}

// eslint-disable-next-line max-lines-per-function, complexity
export const getTransactions = async (request: any, response: any) => {
  try {
    const { body } = request;
    const datetimeRangeFilter = getRangeFilter(body.startDate, body.endDate);
    console.log({ datetimeRangeFilter });
    let filter: TxActionsFilter = {
      accountId: body.accountId,
      block_timestamp: datetimeRangeFilter,
    };
    if (body.types.length > 0) filter = { ...filter, txType: body.types };
    const transactions: TxActionRow[] = await TxActions.find(filter).sort({ block_timestamp: -1 });
    const task = await TxTasks.findOne({ accountId: body.accountId }).select({ _id: 0 });

    const cleanedTransactions: TxActionRow[] = [];
    // eslint-disable-next-line array-callback-return
    for (const transaction of transactions) {
      /* eslint-disable canonical/sort-keys */
      cleanedTransactions.push({
        accountId: transaction.accountId ?? '',
        txType: transaction.txType ?? '',
        block_timestamp: Number(transaction.block_timestamp) ?? null, // server/src/models/TxActions.js uses Decimal128 for this field, which React can't display. https://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-34-decimal.html
        block_timestamp_utc: transaction.block_timestamp ? getFormattedDatetimeUtcFromBlockTimestamp(transaction.block_timestamp) : '',
        from_account: transaction.from_account ?? '',
        block_height: transaction.block_height ?? null,
        args_base64: transaction.args_base64 ?? '',
        transaction_hash: transaction.transaction_hash ?? '',
        amount_transferred:
          transaction.amount_transferred && transaction.currency_transferred ? await convertAmount(transaction.amount_transferred, transaction.currency_transferred) : '',
        currency_transferred: transaction.currency_transferred ?? '',
        amount_transferred2:
          transaction.amount_transferred2 && transaction.currency_transferred2 ? await convertAmount(transaction.amount_transferred2, transaction.currency_transferred2) : '',
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
