// This file runs automatically from within `server/test_helpers/updateTestData.sh`.
// Or run manually via`./server/node_modules/.bin/ts-node --esm server/test_helpers/updateTestData.ts`

import sqlite3, { Database } from 'sqlite3';
import fs from 'fs/promises';

// You can split the strings using the query delimiter i.e. `;`
// In my case, I used `);` because some data in the queries had `;`.
const splitter = ');';

const DB_FILE = 'server/test_helpers/testData.db'; // or can use `:memory:` as shown at https://github.com/TryGhost/node-sqlite3#usage
const sqlFileName = 'server/test_helpers/testData.sql';

export function createDb() {
  return new sqlite3.Database(DB_FILE, (error: any) => {
    if (error) {
      // Cannot open database
      console.error(error.message);
      throw error;
    } else {
      console.log('Connected to the SQLite database.');
    }
  });
}

async function runEachCommandInFile(db: Database, sqlFileName: string) {
  const sqlCommands = await fs.readFile(sqlFileName, { encoding: 'utf8' });
  // Convert the SQL string to array so that you can run them one at a time. https://levelup.gitconnected.com/running-sql-queries-from-an-sql-file-in-a-nodejs-app-sqlite-a927f0e8a545

  const sqlCommandsArray = sqlCommands.split(splitter).map((query, i) => query + splitter); // Add the delimiter back to each query before you run them.
  sqlCommandsArray.pop(); // Remove the last empty query.
  console.log({ sqlCommandsArray });
  // db.serialize ensures that your queries are one after the other depending on which one came first.
  db.serialize(() => {
    // db.run runs your SQL query against the DB.
    db.run('PRAGMA foreign_keys=OFF;');
    db.run('BEGIN TRANSACTION;');
    // Loop through the array and db.run each query.
    sqlCommandsArray.forEach((query, i) => {
      if (query) {
        console.log(`query ${i}`, query.replaceAll(/\n/g, ''));
        console.log('-------------------');
        db.run(query, (error) => {
          if (error) throw error;
        });
      }
    });
    db.run('COMMIT;');
  });
}

async function main() {
  const db = createDb();
  await runEachCommandInFile(db, sqlFileName);

  // Close the DB connection
  db.close((error) => {
    if (error) {
      return console.error(error.message);
    }
    console.log('Closed the database connection.');
  });
}

main();
