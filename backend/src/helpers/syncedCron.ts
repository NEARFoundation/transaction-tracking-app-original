import cron from 'node-cron'; // https://github.com/node-cron/node-cron

import { logSuccess } from '../../../shared/helpers/logging.js';

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
    // console.log('SyncedCron is checking the value of isAlreadyRunning...');

    if (isAlreadyRunning() === false) {
      // console.log('Calling runAllNonRunningTasks() now...');
      try {
        isAlreadyRunningBoolean = true;
        console.info('awaiting runAllNonRunningTasks() now (and isAlreadyRunningBoolean=1)');

        await runAllNonRunningTasks();

        logSuccess('Finished awaiting runAllNonRunningTasks.');
        isAlreadyRunningBoolean = false;
        logSuccess(`Finished cron, so isAlreadyRunningBoolean = ${isAlreadyRunningBoolean}`);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log('SyncedCron: runAllNonRunningTasks is already running.');
    }
  },
  {
    scheduled: false,
  },
);
