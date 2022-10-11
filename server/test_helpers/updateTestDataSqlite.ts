// This file is deprecated.

// This file runs automatically from within `server/test_helpers/updateTestData.sh`.
// Or run manually via`./server/node_modules/.bin/ts-node --esm server/test_helpers/updateTestDataSqlite.ts`

import fs from 'fs/promises';

import sqlite3, { type Database } from 'sqlite3';

// You can split the strings using the query delimiter i.e. `;`
// In my case, I used `);` because some data in the queries had `;`.
const splitter = ');';

const DB_FILE = 'server/test_helpers/testData.db'; // or can use `:memory:` as shown at https://github.com/TryGhost/node-sqlite3#usage
const mainSqlFileName = 'server/test_helpers/testData.sql';

export function createDatabase() {
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

async function runEachCommandInFile(database: Database, sqlFileName: string) {
  const sqlCommands = await fs.readFile(sqlFileName, { encoding: 'utf8' });
  // Convert the SQL string to array so that you can run them one at a time. https://levelup.gitconnected.com/running-sql-queries-from-an-sql-file-in-a-nodejs-app-sqlite-a927f0e8a545

  const sqlCommandsArray = sqlCommands.split(splitter).map((query, index) => query + splitter); // Add the delimiter back to each query before you run them.
  sqlCommandsArray.pop(); // Remove the last empty query.
  console.log({ sqlCommandsArray });
  // db.serialize ensures that your queries are one after the other depending on which one came first.
  database.serialize(() => {
    // db.run runs your SQL query against the DB.
    database.run('PRAGMA foreign_keys=OFF;');
    database.run('BEGIN TRANSACTION;');
    // Loop through the array and db.run each query.
    for (const [index, query] of sqlCommandsArray.entries()) {
      if (query) {
        console.log(`query ${index}`, query.replaceAll(/\n/g, ''));
        console.log('-------------------');
        database.run(query, (error) => {
          if (error) throw error;
        });
      }
    }

    database.run('COMMIT;');
  });
}

async function main() {
  const database = createDatabase();
  await runEachCommandInFile(database, mainSqlFileName);

  // Close the DB connection
  database.close((error) => {
    if (error) {
      console.error(error.message);
      return;
    }

    console.log('Closed the database connection.');
  });
}

main();
