import cron from 'node-cron'; // https://github.com/node-cron/node-cron

import { getFormattedUtcDatetimeNow } from '../../../shared/helpers/datetime.js';

import { CRON_SCHEDULE } from './config.js';
import { runAllNonRunningTasks } from './updateTransactions.js';

let isAlreadyRunningBoolean = false;

function isAlreadyRunning(): boolean {
  return isAlreadyRunningBoolean;
}

export const SyncedCron = cron.schedule(
  CRON_SCHEDULE,
  async () => {
    // console.log('========================================');
    // console.log(getFormattedUtcDatetimeNow(), 'SyncedCron is checking the value of isAlreadyRunning...');

    if (isAlreadyRunning() === false) {
      console.log(getFormattedUtcDatetimeNow(), 'Calling runAllNonRunningTasks() now...');
      try {
        isAlreadyRunningBoolean = true;
        // console.log('is now set to 1 because about to call runAllNonRunningTasks');
        const promises = await runAllNonRunningTasks();
        await Promise.all(promises);
      } catch (error) {
        console.error(error);
      }

      isAlreadyRunningBoolean = false;
      console.log(getFormattedUtcDatetimeNow(), `Finished cron, so isAlreadyRunningBoolean = ${isAlreadyRunningBoolean}`);
    } else {
      console.log(getFormattedUtcDatetimeNow(), 'SyncedCron: runAllNonRunningTasks is already running.');
    }
  },
  {
    scheduled: false,
  },
);
