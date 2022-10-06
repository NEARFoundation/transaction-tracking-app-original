import csvToJson from 'convert-csv-to-json';

import { type RowOfExpectedOutput } from '../../shared/types';

const csvFilename = './server/test_helpers/expectedOutput.csv';

export function getRowsOfExpectedOutput(): RowOfExpectedOutput[] {
  const rowsOfExpectedOutput: RowOfExpectedOutput[] = csvToJson.fieldDelimiter(',').getJsonFromCsv(csvFilename); // https://www.npmjs.com/package/convert-csv-to-json
  return rowsOfExpectedOutput;
}
