/* eslint-disable import/extensions */
import { addTasks } from '../services/addTasks.js';
import { getAccounts } from '../services/getAccounts.js';
import { getTransactions } from '../services/getTransactions.js';
import { getTypes } from '../services/getTypes.js';
/* eslint-enable import/extensions */

export const routes = (app) => {
  app.post('/transactions', getTransactions);
  app.get('/types', getTypes);
  app.post('/accounts', getAccounts);
  app.post('/add-tasks', addTasks);
};
