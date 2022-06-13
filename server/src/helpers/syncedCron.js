import cron from "node-cron";
import {runTasks} from "./updateTransactions.js";

export const SyncedCron = cron.schedule('*/10 * * * *', () =>  {
    runTasks().then();
    console.log('SyncedCron: runTasks starts...');
}, {
    scheduled: false
});

