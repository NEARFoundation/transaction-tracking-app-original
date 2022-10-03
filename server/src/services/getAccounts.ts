import { getFormattedUtcDatetime } from '../../../shared/helpers/datetime.js';
import { type AccountStatus } from '../../../shared/types';
import { respondWithServerError } from '../helpers/errors.js';
import { TxActions } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';

export const getAccounts = async (request: any, response: any) => {
  const { body } = request;
  const accountIds = body.accountIds;
  console.log(`getAccounts. body=${JSON.stringify(body)}`);
  try {
    const accounts: AccountStatus[] = [];
    for (const accountId of accountIds) {
      console.log('getAccounts', accountId);
      const txTaskForAccount = await TxTasks.findOne({ accountId }).select({ __v: 0, _id: 0 });
      const transactions = await TxActions.findOne({ accountId });
      let lastUpdate: any;
      let status = 'Pending';
      if (txTaskForAccount) {
        // if (txTaskForAccount.lastUpdate === 0) status = 'Pending';
        if (txTaskForAccount.isRunning) status = 'In progress';
        else if (transactions) status = 'Done';
        else if (!transactions && txTaskForAccount.lastUpdate > 0) status = 'No data';

        if (txTaskForAccount.lastUpdate > 0) {
          lastUpdate = getFormattedUtcDatetime(new Date(txTaskForAccount.lastUpdate));
        }
      } else {
        status = 'The account is not monitored. Please add the account again.';
      }

      accounts.push({ accountId, lastUpdate, status });
      console.log(accounts);
    }

    response.send({ accounts });
  } catch (error) {
    respondWithServerError(response, error);
  }
};
