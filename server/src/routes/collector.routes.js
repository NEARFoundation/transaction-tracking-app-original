/* eslint-disable import/extensions */
import { addTasks } from '../services/addTasks.js';
import { deleteAccountData } from '../services/deleteAccountData.js';
import { getAccounts } from '../services/getAccounts.js';
import { getTransactions } from '../services/getTransactions.js';
import { getTypes } from '../services/getTypes.js';
/* eslint-enable import/extensions */

export const routes = (app) => {
  app.post('/transactions', getTransactions);
  app.get('/types', getTypes);
  app.post('/accounts', getAccounts);
  app.post('/addTasks', addTasks);
  app.post('/deleteAccountData', deleteAccountData);
};
