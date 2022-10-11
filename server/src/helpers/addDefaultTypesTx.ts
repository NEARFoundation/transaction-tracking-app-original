import fs from 'node:fs';
import path from 'node:path';

import { TxTasks } from '../models/TxTasks.js';
import { TxTypes } from '../models/TxTypes.js';

export const addDefaultTypesTx = async () => {
  const sqlFolder = './src/helpers/TxTypes/';
  console.log({ sqlFolder });
  await TxTasks.updateMany({ isRunning: true }, { isRunning: false })
    .then()
    .catch((error) => console.log(error));
  fs.readdir(sqlFolder, (readdirError, files) => {
    for (const file of files) {
      if (path.extname(file) === '.sql') {
        fs.readFile(sqlFolder + file, 'utf8', (readFileError, data) => {
          if (data) {
            console.log(file); // Or use `console.log(path.parse(file).name);` if you don't want the extension.
            // eslint-disable-next-line promise/valid-params
            TxTypes.findOneAndUpdate(
              { name: path.parse(file).name },
              {
                name: path.parse(file).name,
                sql: data,
              },
              { upsert: true },
            )
              .then()
              .catch((error) => console.error(error)); // TODO: Check this line and the rest of this repo against advice at https://stackoverflow.com/questions/50896442/why-is-catcherr-console-errorerr-discouraged
          }
        });
      }
    }
  });
};
