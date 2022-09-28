import { getFormattedDatetimeUtcFromBlockTimestamp, getRangeFilter } from '../../../shared/helpers/datetime.js';
import { respondWithServerError } from '../../../shared/helpers/errors.js';
import { TxActionRow, TxActionsFilter } from '../../../shared/types';
import { TxActions } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';

export const getTransactions = async (request, response) => {
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
    transactions.map((transaction) => {
      /* eslint-disable canonical/sort-keys */
      cleanedTransactions.push({
        accountId: transaction.accountId,
        txType: transaction.txType,
        block_timestamp: Number(transaction.block_timestamp), // server/src/models/TxActions.js uses Decimal128 for this field, which React can't display. https://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-34-decimal.html
        block_timestamp_utc: getFormattedDatetimeUtcFromBlockTimestamp(transaction.block_timestamp),
        from_account: transaction.from_account,
        block_height: transaction.block_height,
        args_base64: transaction.args_base64,
        transaction_hash: transaction.transaction_hash,
        amount_transferred: transaction.amount_transferred,
        currency_transferred: transaction.currency_transferred,
        amount_transferred2: transaction.amount_transferred2,
        currency_transferred2: transaction.currency_transferred2,
        receiver_owner_account: transaction.receiver_owner_account,
        receiver_lockup_account: transaction.receiver_lockup_account,
        lockup_start: transaction.lockup_start,
        lockup_duration: transaction.lockup_duration,
        cliff_duration: transaction.cliff_duration,
      });
      /* eslint-enable canonical/sort-keys */
    });

    response.send({ lastUpdate: task ? task.lastUpdate : null, transactions: cleanedTransactions });
  } catch (error) {
    respondWithServerError(response, error);
  }
};
