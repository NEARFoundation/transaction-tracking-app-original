import fs from 'node:fs';
import path from 'node:path';

import { TxTasks } from '../models/TxTasks.js';
import { TxTypes } from '../models/TxTypes.js';

export const DOT_SQL = '.sql';

export function getSqlFolder(subfolder = ''): string {
  const sqlFolder = `${subfolder}src/helpers/TxTypes/`;
  console.log({ sqlFolder });
  return sqlFolder;
}

export async function addTransactionTypeSqlToDatabase(sqlFolder: string, file: string) {
  const data = fs.readFileSync(sqlFolder + file, 'utf8');

  // console.log({ file, data }); // Or use `console.log(path.parse(file).name);` if you don't want the extension.
  // eslint-disable-next-line promise/valid-params
  try {
    await TxTypes.findOneAndUpdate(
      { name: path.parse(file).name },
      {
        name: path.parse(file).name,
        sql: data,
      },
      { upsert: true },
    );
  } catch (error) {
    console.error(error);
  }
}

export const addDefaultTypesTx = async () => {
  const sqlFolder = getSqlFolder();
  try {
    await TxTasks.updateMany({ isRunning: true }, { isRunning: false });
  } catch (error) {
    console.error(error);
    return;
  }

  const files = fs.readdirSync(sqlFolder);
  console.log({ files });
  for (const file of files) {
    if (path.extname(file) === DOT_SQL) {
      await addTransactionTypeSqlToDatabase(sqlFolder, file);
    }
  }
};
