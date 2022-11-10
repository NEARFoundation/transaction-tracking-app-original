import cron from 'node-cron'; // https://github.com/node-cron/node-cron

import { logger } from '../../../shared/helpers/logging.js';

import { CRON_SCHEDULE } from './config.js';
import { runAllNonRunningTasks } from './updateTransactions.js';

export const SyncedCron = cron.schedule(
  CRON_SCHEDULE,
  async () => {
    // logger.debug('Awaiting runAllNonRunningTasks() within cron job.');
    const accountsStillRunning = await runAllNonRunningTasks();
    logger.success('Finished awaiting runAllNonRunningTasks. (Finished cron.)', { accountsStillRunning });
  },
  {
    scheduled: false,
  },
);
