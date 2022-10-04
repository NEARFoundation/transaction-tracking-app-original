import { runTask } from '../helpers/updateTransactions.js';
import { addTasks } from '../services/addTasks.js';
import { deleteAccountData } from '../services/deleteAccountData.js';
import { getAccounts } from '../services/getAccounts.js';
import { getTransactions } from '../services/getTransactions.js';
import { getTypes } from '../services/getTypes.js';

export const routes = (app) => {
  app.post('/transactions', getTransactions);
  app.get('/types', getTypes);
  app.post('/accounts', getAccounts);
  app.post('/addTasks', addTasks);
  app.post('/runTask', runTask);
  app.post('/deleteAccountData', deleteAccountData);
};
