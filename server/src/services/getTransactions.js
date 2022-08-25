/* eslint-disable import/extensions */
import { TxActions } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';
/* eslint-enable import/extensions */

export const getTransactions = async (request, response) => {
  try {
    console.log(request.body.endDate);
    let filter = {
      accountId: request.body.accountId,
      block_timestamp: {
        $gte: Math.floor(new Date(request.body.startDate).getTime()) * 1_000_000, // TODO: Use helper in datetime.ts
        $lte: Math.floor(new Date(request.body.endDate).getTime()) * 1_000_000,
      },
    };
    if (request.body.types.length > 0) filter = { ...filter, txType: request.body.types };
    const transactions = await TxActions.find(filter).sort({ block_timestamp: -1 });
    const task = await TxTasks.findOne({ accountId: request.body.accountId }).select({ _id: 0 });

    const transactions2 = [];
    // eslint-disable-next-line array-callback-return
    transactions.map((tr) => {
      /* eslint-disable canonical/sort-keys */
      transactions2.push({
        accountId: tr.accountId,
        txType: tr.txType,
        block_timestamp: tr.block_timestamp.toString(),
        from_account: tr.from_account,
        block_height: tr.block_height,
        args_base64: tr.args_base64,
        transaction_hash: tr.transaction_hash,
        amount_transferred: tr.amount_transferred,
        currency_transferred: tr.currency_transferred,
        amount_transferred2: tr.amount_transferred2,
        currency_transferred2: tr.currency_transferred2,
        receiver_owner_account: tr.receiver_owner_account,
        receiver_lockup_account: tr.receiver_lockup_account,
        lockup_start: tr.lockup_start,
        lockup_duration: tr.lockup_duration,
        cliff_duration: tr.cliff_duration,
      });
      /* eslint-enable canonical/sort-keys */
    });

    response.send({ lastUpdate: task ? task.lastUpdate : null, transactions: transactions2 });
  } catch (error) {
    console.log(error);
    response.status(500).send({ error: 'Please try again' });
  }
};
