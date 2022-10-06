import fs from 'node:fs';

// eslint-disable-next-line canonical/id-match
import csv2json from 'csvjson-csv2json';

import { type RowOfExpectedOutput } from '../../../shared/types';

const csvFilename = './server/test_helpers/expectedOutput.csv';

export function getRowsOfExpectedOutput(): RowOfExpectedOutput[] {
  const csv = fs.readFileSync(csvFilename, 'utf8');
  // console.log({ csv });
  const rowsOfExpectedOutput: RowOfExpectedOutput[] = csv2json(csv, { parseNumbers: true, parseJSON: true }); // https://www.npmjs.com/package/csvjson-csv2json
  // console.log({ rowsOfExpectedOutput });
  return rowsOfExpectedOutput;
}
