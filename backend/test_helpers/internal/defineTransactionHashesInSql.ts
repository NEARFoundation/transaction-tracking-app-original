// This file gets called automatically via updateTestData.sh.
// It can also be called manually via `yarn ts-node  --esm ./backend/test_helpers/internal/defineTransactionHashesInSql.ts`.

import fs from 'node:fs';

import { getRowsOfExpectedOutput } from './csvToJson.js';

const transactionHashesFilename = './backend/test_helpers/internal/transactionHashes.sql';
const rowsOfExpectedOutput = getRowsOfExpectedOutput();

// console.log({ rowsOfExpectedOutput });

const transactionHashes: string[] = [];
for (const rowOfExpectedOutput of rowsOfExpectedOutput) {
  transactionHashes.push(`('${rowOfExpectedOutput.transaction_hash}')`);
}

const sqlOutput = `CREATE TEMP TABLE transactionHashes AS
WITH t (transactionHash) AS (
 VALUES
 ${transactionHashes.join(',\n')}
 )
SELECT * FROM t;`;
// console.log(sqlOutput);

fs.writeFileSync(transactionHashesFilename, sqlOutput);
