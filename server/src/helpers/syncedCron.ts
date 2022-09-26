import cron from 'node-cron'; // https://github.com/node-cron/node-cron
import { runTasks } from './updateTransactions.js';

export const SyncedCron = cron.schedule(
  '* * * * *', // every minute
  //'0/5 * * * * *', // every 5 seconds. This line does not seem to work. https://www.freeformatter.com/cron-expression-generator-quartz.html
  async () => {
    console.log(new Date(), 'SyncedCron calls runTasks...');
    await runTasks();
  },
  {
    scheduled: false,
  },
);
