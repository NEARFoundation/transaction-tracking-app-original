import cron from 'node-cron'; // https://github.com/node-cron/node-cron

import { CRON_SCHEDULE } from './config.js';
import { runAllNonRunningTasks } from './updateTransactions.js';

export const SyncedCron = cron.schedule(
  CRON_SCHEDULE,
  async () => {
    console.debug('Awaiting runAllNonRunningTasks().');
    await runAllNonRunningTasks();
    console.log('Finished awaiting runAllNonRunningTasks. (Finished cron.)');
  },
  {
    scheduled: false,
  },
);
