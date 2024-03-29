import { type Response, type Request } from 'express';

import { getFormattedUtcDatetime } from '../../../shared/helpers/datetime.js';
import { type AccountStatus } from '../../../shared/types';
import { respondWithServerError } from '../helpers/errors.js';
import { TxActions } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';

import { addTaskForAccount } from './addTasks.js';

// eslint-disable-next-line max-lines-per-function
export const getAccounts = async (request: Request, response: Response) => {
  const { body } = request;
  const { accountIds } = body;
  console.log(`getAccounts. body=${JSON.stringify(body)}`);
  try {
    const accounts: AccountStatus[] = [];
    for (const accountId of accountIds) {
      console.log('getAccounts', accountId);
      const txTaskForAccount = await TxTasks.findOne({ accountId }).select({ __v: 0, _id: 0 });
      const transactions = await TxActions.findOne({ accountId });
      let lastUpdate = '';
      let status = 'Pending';
      if (txTaskForAccount) {
        // if (txTaskForAccount.lastUpdate === 0) status = 'Pending';
        if (txTaskForAccount.isRunning) {
          status = 'In progress';
        } else if (transactions) {
          status = 'Done';
        } else if (!transactions && txTaskForAccount.lastUpdate > 0) {
          status = 'No data';
        }

        if (txTaskForAccount.lastUpdate > 0) {
          lastUpdate = getFormattedUtcDatetime(new Date(txTaskForAccount.lastUpdate));
        }
      } else {
        // Here, it seems that the frontend localStorage had 1 or more account IDs that are missing from the Mongo cache called TxTasks. Automatically add the corresponding TxTask as necessary:
        status = 'The cache for this account seems missing. Re-downloading account data now. You can refresh this page soon to check.';

        addTaskForAccount(accountId)
          // eslint-disable-next-line promise/prefer-await-to-then, @typescript-eslint/no-empty-function
          .then((value: any) => {})
          // eslint-disable-next-line promise/prefer-await-to-then
          .catch((error) => {
            console.error(error);
          });
      }

      accounts.push({ accountId, lastUpdate, status });
      console.log(accounts);
    }

    response.send({ accounts });
  } catch (error) {
    respondWithServerError(response, error);
  }
};
