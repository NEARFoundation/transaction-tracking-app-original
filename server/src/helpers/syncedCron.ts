import cron from 'node-cron'; // https://github.com/node-cron/node-cron

import { getFormattedUtcDatetimeNow } from '../../../shared/helpers/datetime.js';

import { runAllNonRunningTasks } from './updateTransactions.js';

let isAlreadyRunning = 0;

export const SyncedCron = cron.schedule(
  '* * * * *', // every minute
  // '0/5 * * * * *', // every 5 seconds. This line does not seem to work. https://www.freeformatter.com/cron-expression-generator-quartz.html
  async () => {
    console.log(getFormattedUtcDatetimeNow(), 'SyncedCron is checking the value of isAlreadyRunning...');
    if (isAlreadyRunning === 0) {
      try {
        isAlreadyRunning = 1;
        console.log('runAllNonRunningTasks() isAlreadyRunning', getFormattedUtcDatetimeNow());
        await runAllNonRunningTasks();
      } catch (error) {
        console.error(error);
      }

      isAlreadyRunning = 0;
    } else {
      console.log('SyncedCron: runAllNonRunningTasks is already running.');
    }
  },
  {
    scheduled: false,
  },
);
