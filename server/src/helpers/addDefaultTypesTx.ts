import fs from 'node:fs';
import path from 'node:path';

import { TxTasks } from '../models/TxTasks.js';
import { TxTypes } from '../models/TxTypes.js';

export const addDefaultTypesTx = async (subfolder = '.') => {
  const sqlFolder = `${subfolder}/src/helpers/TxTypes/`;
  console.log({ sqlFolder });
  await TxTasks.updateMany({ isRunning: true }, { isRunning: false })
    .then()
    .catch((error) => console.log(error));
  const files = fs.readdirSync(sqlFolder);
  console.log({ files });
  for (const file of files) {
    if (path.extname(file) === '.sql') {
      const data = fs.readFileSync(sqlFolder + file, 'utf8');

      // console.log({ file, data }); // Or use `console.log(path.parse(file).name);` if you don't want the extension.
      // eslint-disable-next-line promise/valid-params
      TxTypes.findOneAndUpdate(
        { name: path.parse(file).name },
        {
          name: path.parse(file).name,
          sql: data,
        },
        { upsert: true },
      );
    }
  }
};
