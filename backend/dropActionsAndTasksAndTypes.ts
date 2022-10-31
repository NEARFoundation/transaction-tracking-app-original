// Run via `yarn dropActionsAndTasksAndTypes` or `yarn ts-node --esm ./backend/dropActionsAndTasksAndTypes.ts`.

import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { TxActions } from './src/models/TxActions.js';
import { TxTasks } from './src/models/TxTasks.js';
import { TxTypes } from './src/models/TxTypes.js';

const result = dotenv.config({ path: './backend/.env.development.local' });
if (result.error) {
  throw result.error;
}

console.log(result.parsed);

async function main() {
  const mongoConnectionString = process.env.MONGO ?? '';
  console.log({ mongoConnectionString });
  await mongoose.connect(mongoConnectionString);
  await TxActions.deleteMany({});
  console.log('Deleted all TxActions.');
  await TxTasks.deleteMany({});
  console.log('Deleted all TxTasks.');
  await TxTypes.deleteMany({});
  console.log('Deleted all TxTypes.');
  console.log('Finished.');
  process.exit(0); // https://stackoverflow.com/a/52461246/
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();