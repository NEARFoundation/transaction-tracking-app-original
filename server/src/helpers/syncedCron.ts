import cron from 'node-cron'; // https://github.com/node-cron/node-cron

import { runAllNonRunningTasks } from './updateTransactions.js';

export const SyncedCron = cron.schedule(
  '* * * * *', // every minute
  // '0/5 * * * * *', // every 5 seconds. This line does not seem to work. https://www.freeformatter.com/cron-expression-generator-quartz.html
  async () => {
    console.log(new Date(), 'SyncedCron calls runAllNonRunningTasks...');
    await runAllNonRunningTasks();
  },
  {
    scheduled: false,
  },
);
