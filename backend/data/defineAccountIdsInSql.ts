/* This file can be called manually via `yarn ts-node --esm ./backend/data/defineAccountIdsInSql.ts`.
  Using account IDs provided in the environment variables, it generates a "CREATE TEMP TABLE" SQL query that gets saved 
  to './backend/test_helpers/internal/accountIds.sql'. Eventually, this will be used in a similar manner as what happens 
  in `backend/test_helpers/updateTestData.sh`. */

import fs from 'node:fs';

import { type AccountId } from '../../shared/types/index.js';
import { accountIdsToCheckJson } from '../src/helpers/config.js';

const accountIds = JSON.parse(accountIdsToCheckJson);
console.log({ accountIds });
const accountIdsFilename = './backend/data/accountIds.sql';

const sqlOutput = `CREATE TEMP TABLE accountIds AS
WITH a (accountId) AS (
 VALUES
 ${accountIds.map((accountId: AccountId) => `('${accountId}')`).join(',\n')}
 )
SELECT * FROM a;`;
// console.log(sqlOutput);

fs.writeFileSync(accountIdsFilename, sqlOutput);
