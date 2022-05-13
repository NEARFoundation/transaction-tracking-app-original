import {getTransactions} from "../services/getTransactions.js";
import {addTask} from "../services/addTask.js";

export const routes = app => {
    app.get('/transactions', getTransactions);
    app.get('/add-task', addTask);
}