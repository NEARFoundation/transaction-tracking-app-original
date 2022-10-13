// This file simply converts './backend/test_helpers/expectedOutput.csv' to JSON, which gets used by `backend/test_helpers/updateTestData.sh` (via `backend/test_helpers/internal/defineTransactionHashesInSql.ts`) and also by backend/src/helpers/updateTransactions.test.ts.

import fs from 'node:fs';

// eslint-disable-next-line canonical/id-match
import csv2json from 'csvjson-csv2json';

import { type RowOfExpectedOutput } from '../../../shared/types';

const csvFilename = './backend/test_helpers/expectedOutput.csv';

export function getRowsOfExpectedOutput(): RowOfExpectedOutput[] {
  const csv = fs.readFileSync(csvFilename, 'utf8');
  // console.log({ csv });
  const rowsOfExpectedOutput: RowOfExpectedOutput[] = csv2json(csv, { parseNumbers: true, parseJSON: false }); // https://www.npmjs.com/package/csvjson-csv2json
  // console.log({ rowsOfExpectedOutput });
  return rowsOfExpectedOutput;
}
