// Run via `yarn ts-node  --esm ./server/test_helpers/getTransactionHashes.ts`

import fs from 'node:fs';

import { getRowsOfExpectedOutput } from './csvToJson.js';

const transactionHashesFilename = './server/test_helpers/transactionHashes.txt';
const rowsOfExpectedOutput = getRowsOfExpectedOutput();

// console.log({ rowsOfExpectedOutput });

const transactionHashes: string[] = [];
for (const rowOfExpectedOutput of rowsOfExpectedOutput) {
  transactionHashes.push(`('${rowOfExpectedOutput.transaction_hash}')`);
}

const sqlOutput = transactionHashes.join(',\n');
// console.log(sqlOutput);

fs.writeFileSync(transactionHashesFilename, sqlOutput);

console.log(`Now, copy from ${transactionHashesFilename} into server/test_helpers/createTempTablesOfRowsWithSpecificTransactions.sql.`);
