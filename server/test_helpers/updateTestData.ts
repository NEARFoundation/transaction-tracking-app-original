import fs from 'fs/promises';
import pg from 'pg';

const sqlFileName = 'server/test_helpers/testData.sql';

const connectionString = process.env.POSTGRESQL_CONNECTION_STRING;

export async function seedTheMockIndexerDb() {
  console.log('seedTheMockIndexerDb');
  const pgClient = new pg.Client({ connectionString });
  await pgClient.connect();
  const sqlCommands = await fs.readFile(sqlFileName, { encoding: 'utf8' });
  pgClient.query(sqlCommands);
  await pgClient.end();
}
