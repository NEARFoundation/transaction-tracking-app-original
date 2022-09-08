/* eslint-disable import/extensions */
import { TxActions } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';
/* eslint-enable import/extensions */

export const getAccounts = async (request, response) => {
  const accountIds = request.body.accountId;
  console.log('getAccounts accountIds', accountIds);
  try {
    const accounts = [];
    for (const accountId of accountIds) {
      console.log('getAccounts', accountId);
      const account = await TxTasks.findOne({ accountId }).select({ __v: 0, _id: 0 });
      const transactions = await TxActions.findOne({ accountId });
      let lastUpdate;
      let status;
      if (account) {
        if (account.lastUpdate === 0) status = 'Pending';
        if (account.isRunning) status = 'In progress';
        else if (transactions) status = 'Done';
        else if (!transactions && account.lastUpdate > 0) status = 'No data';

        if (account.lastUpdate > 0) lastUpdate = new Date(account.lastUpdate).toLocaleString(); // TODO: Improve date formatting
      } else {
        status = 'The account is not monitored.';
      }

      accounts.push({ accountId, lastUpdate, status });
      console.log(accounts);
    }

    response.send({ accounts });
  } catch (error) {
    console.error(error);
    response.status(500).send({ error: 'Server error. Please try again.' });
  }
};
