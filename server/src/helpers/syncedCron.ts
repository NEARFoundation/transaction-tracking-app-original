import cron from 'node-cron'; // https://github.com/node-cron/node-cron

import { getFormattedUtcDatetimeNow } from '../../../shared/helpers/datetime.js';

import { runAllNonRunningTasks } from './updateTransactions.js';

let isAlreadyRunningBoolean = false;

function isAlreadyRunning(): boolean {
  return isAlreadyRunningBoolean;
}

export const SyncedCron = cron.schedule(
  '* * * * *', // every minute
  // '* * * * * *', // every second. Only for careful local development purposes. https://www.freeformatter.com/cron-expression-generator-quartz.html
  // '0/5 * * * * *', // every 5 seconds. This line does not seem to work. https://www.freeformatter.com/cron-expression-generator-quartz.html
  async () => {
    // console.log('========================================');
    // console.log(getFormattedUtcDatetimeNow(), 'SyncedCron is checking the value of isAlreadyRunning...');

    if (isAlreadyRunning() === false) {
      console.log(getFormattedUtcDatetimeNow(), 'Calling runAllNonRunningTasks() now...');
      try {
        isAlreadyRunningBoolean = true;
        // console.log('is now set to 1 because about to call runAllNonRunningTasks');
        await runAllNonRunningTasks();
      } catch (error) {
        console.error(error);
      }

      isAlreadyRunningBoolean = false;
      console.log(`Finished cron, so isAlreadyRunningBoolean = ${isAlreadyRunningBoolean}`);
    } else {
      console.log('SyncedCron: runAllNonRunningTasks is already running.');
    }
  },
  {
    scheduled: false,
  },
);
