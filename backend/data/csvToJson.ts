// This file simply converts './backend/test_helpers/expectedOutput.csv' to JSON, which gets used by `backend/test_helpers/updateTestData.sh` (via `backend/test_helpers/internal/defineTransactionHashesInSql.ts`) and also by backend/src/helpers/updateTransactions.test.ts.

import fs from 'node:fs';

// eslint-disable-next-line canonical/id-match
import csv2json from 'csvjson-csv2json';

import { subfolder } from '../../shared/config.js';
import { type RowOfExpectedOutput } from '../../shared/types';

// console.log({ subfolder });

export function getRowsOfExpectedOutput(csvFilename: string): RowOfExpectedOutput[] {
  console.log({ csvFilename });
  const csv = fs.readFileSync(`./${subfolder}${csvFilename}`, 'utf8');
  // console.log({ csv });
  const rowsOfExpectedOutput: RowOfExpectedOutput[] = csv2json(csv, { parseNumbers: false, parseJSON: false }); // https://www.npmjs.com/package/csvjson-csv2json
  // console.log({ rowsOfExpectedOutput });
  return rowsOfExpectedOutput;
}
