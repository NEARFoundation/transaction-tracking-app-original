import fs from 'node:fs';

// eslint-disable-next-line canonical/id-match
import json2csv from 'csvjson-json2csv'; // https://www.npmjs.com/package/csvjson-json2csv

const subfolder = process.env.BACKEND_FOLDER ?? '';

const csvFilename = `./${subfolder}test_helpers/internal/possibleExpectedOutput.csv`;

export default function jsonToCsv(object: any) {
  const csv = json2csv(object, { output_csvjson_variant: false, flatten: false, separator: ',' });
  // console.log(csv);

  fs.writeFileSync(csvFilename, csv, 'utf8');
}
