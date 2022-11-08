import fs from 'node:fs';

import { getRowsOfExpectedOutput } from './csvToJson.js';

const transactionHashesFilename = './backend/data/transactionHashes.sql';
const transactionHashesCsv = 'data/transactionHashes.csv';
const rowsOfExpectedOutput = getRowsOfExpectedOutput(transactionHashesCsv);

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
