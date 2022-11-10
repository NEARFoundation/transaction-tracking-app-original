/* This file gets called automatically via updateTestData.sh.
 It can also be called manually via `yarn ts-node  --esm ./backend/test_helpers/internal/defineTransactionHashesInSql.ts`.
 It finds all of the transaction hashes of './backend/test_helpers/expectedOutput.csv' and uses them while crafting a "CREATE TEMP 
 TABLE" SQL query that gets saved to './backend/test_helpers/internal/transactionHashes.sql', which then will be concatenated with 
 `backend/data/tableDefinitions.sql` from within `backend/test_helpers/updateTestData.sh`. */

import fs from 'node:fs';

import { subfolder } from '../../../shared/config.js';
import { getRowsOfExpectedOutput } from '../../data/csvToJson.js';

const transactionHashesFilename = `./${subfolder}test_helpers/internal/transactionHashes.sql`;
export const EXPECTED_OUTPUT_FILENAME = 'test_helpers/expectedOutput.csv';
const rowsOfExpectedOutput = getRowsOfExpectedOutput(EXPECTED_OUTPUT_FILENAME);

// console.log({ rowsOfExpectedOutput });

const transactionHashes: Set<string> = new Set();
for (const rowOfExpectedOutput of rowsOfExpectedOutput) {
  transactionHashes.add(`('${rowOfExpectedOutput.transaction_hash}')`);
}

const sqlOutput = `DROP TABLE IF EXISTS transactionHashes;
CREATE TEMP TABLE transactionHashes AS
WITH t (transactionHash) AS (
 VALUES
 ${Array.from(transactionHashes).join(',\n')}
 )
SELECT * FROM t;`;
// console.log(sqlOutput);

fs.writeFileSync(transactionHashesFilename, sqlOutput);
