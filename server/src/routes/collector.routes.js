import {getTransactions} from "../services/getTransactions.js";
import {addTasks} from "../services/addTasks.js";
import {getTypes} from "../services/getTypes.js";
import {getAccounts} from "../services/getAccounts.js";
import {runTask} from "../helpers/updateTransactions.js";

export const routes = app => {
    app.post('/transactions', getTransactions);
    app.get('/types', getTypes);
    app.post('/accounts', getAccounts);
    app.post('/add-tasks', addTasks);
    app.post('/run-task', runTask);
}