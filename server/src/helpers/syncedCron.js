import cron from "node-cron";
import {runTasks} from "./updateTransactions.js";

export const SyncedCron = cron.schedule('*/5 * * * *', async () =>  {
    await runTasks();
    console.log('SyncedCron: runTasks starts...');
}, {
    scheduled: false
});

