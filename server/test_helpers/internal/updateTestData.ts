import fs from 'fs/promises';

import pg from 'pg';

const NODE_ENV = process.env.NODE_ENV;
export const POSTGRESQL_CONNECTION_STRING = process.env.POSTGRESQL_CONNECTION_STRING ?? '';

console.log({ NODE_ENV }, `process.cwd()) = ${process.cwd()}`);

const sqlFileName = './server/test_helpers/internal/testData.sql';

export async function seedTheMockIndexerDatabase() {
  console.log('seedTheMockIndexerDatabase', { POSTGRESQL_CONNECTION_STRING });
  const sqlCommands = await fs.readFile(sqlFileName, { encoding: 'utf8' });
  const pgClient = new pg.Client(POSTGRESQL_CONNECTION_STRING);
  await pgClient.connect();
  await pgClient.query(sqlCommands);
  await pgClient.end();
}
