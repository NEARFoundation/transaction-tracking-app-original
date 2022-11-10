// Run via `yarn dropActionsAndTasksAndTypes` or `yarn ts-node --esm ./backend/dropActionsAndTasksAndTypes.ts`.

import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { logger } from '../shared/helpers/logging.js';

import { TxActions } from './src/models/TxActions.js';
import { TxTasks } from './src/models/TxTasks.js';
import { TxTypes } from './src/models/TxTypes.js';

const result = dotenv.config({ path: './backend/.env.development.local' });
if (result.error) {
  throw result.error;
}

// logger.info(result.parsed);

async function main() {
  const mongoConnectionString = process.env.MONGO ?? '';
  // logger.info({ mongoConnectionString });
  await mongoose.connect(mongoConnectionString);
  await TxActions.deleteMany({});
  logger.info('Deleted all TxActions.');
  await TxTasks.deleteMany({});
  logger.info('Deleted all TxTasks.');
  await TxTypes.deleteMany({});
  logger.info('Deleted all TxTypes.');
  logger.info('Finished.');
  process.exit(0); // https://stackoverflow.com/a/52461246/
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
