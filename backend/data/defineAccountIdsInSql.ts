/* This file can be called manually via `yarn ts-node --esm ./backend/data/defineAccountIdsInSql.ts`.
  Using account IDs provided in the environment variables, it generates './backend/test_helpers/internal/accountIds.csv',
  which gets used in the WHERE clause of the SQL queries. */

import fs from 'node:fs';

import { type AccountId } from '../../shared/types/index.js';
import { accountIdsToCheckJson } from '../src/helpers/config.js';

const accountIds = JSON.parse(accountIdsToCheckJson);
const output = accountIds.map((accountId: AccountId) => `'${accountId}'`).join(', ');
const accountIdsFilename = './backend/data/accountIds.csv';
console.log({ output });

fs.writeFileSync(accountIdsFilename, output);
