// Run via `yarn test backend/src/helpers/updateTransactions.test.ts`.

// https://jestjs.io/docs/setup-teardown#scoping

import mongoose, { type Mongoose } from 'mongoose';

import { type TxActionRow, type AccountId } from '../../../shared/types';
import { getRowsOfExpectedOutput } from '../../test_helpers/internal/csvToJson';
import jsonToCsv from '../../test_helpers/internal/jsonToCsv';
import { seedTheMockIndexerDatabase } from '../../test_helpers/internal/updateTestData';
import { TxActions, convertFromModelToTxActionRow, cleanExpectedOutputFromCsv } from '../models/TxActions';
import { TxTypes } from '../models/TxTypes';

import { addTransactionTypeSqlToDatabase, DOT_SQL, getSqlFolder } from './addDefaultTypesTx';
import { DEFAULT_LENGTH, mongoConnectionString } from './config';
import { updateTransactions } from './updateTransactions';

const subfolder = process.env.BACKEND_FOLDER ?? '';

// eslint-disable-next-line max-lines-per-function
describe('updateTransactions', () => {
  let connection: Mongoose;
  let sqlFolder: string;

  beforeAll(async () => {
    // Before any of this suite starts running, connect to Mongo, connect to PostgreSQL, seed the PostgreSQL test database, and close the PostgreSQL test database connection.
    connection = await mongoose.connect(mongoConnectionString);
    sqlFolder = getSqlFolder(subfolder);
    const txTypesCountDocuments = await TxTypes.countDocuments();
    console.log({ txTypesCountDocuments });
    await seedTheMockIndexerDatabase();
  });

  afterAll(async () => {
    // After all the tests of this suite finish, close the DB connection.
    await connection.disconnect();
  });

  beforeEach(async () => {
    // At the beginning of each test, clear out the Mongo database.
    await TxTypes.deleteMany({});
    await TxActions.deleteMany({});
  });

  jest.setTimeout(3_000);

  const rowsOfExpectedOutput = getRowsOfExpectedOutput();

  // console.log({ rowsOfExpectedOutput });

  function getRelevantRowsOfExpectedOutput(accountId: AccountId, txType: string) {
    return rowsOfExpectedOutput.filter((row) => row.accountId === accountId && row.txType === txType).map((row) => cleanExpectedOutputFromCsv(row));
  }

  async function runTest(accountId: AccountId, txType: string) {
    test(txType, async () => {
      const file = `${txType}${DOT_SQL}`;
      await addTransactionTypeSqlToDatabase(sqlFolder, file);
      await updateTransactions(accountId, txType, DEFAULT_LENGTH);
      const txActions = await TxActions.find({
        accountId,
        txType,
      }).sort([['block_timestamp', -1]]);
      const txActionsConverted: TxActionRow[] = [];
      for (const txAction of txActions) {
        const txActionConverted = convertFromModelToTxActionRow(txAction);
        txActionsConverted.push(txActionConverted);
      }

      // console.log({ txActionsConverted });
      const relevantRowsOfExpectedOutput = getRelevantRowsOfExpectedOutput(accountId, txType);
      expect(txActionsConverted).toEqual(relevantRowsOfExpectedOutput.sort((a, b) => b.block_timestamp - a.block_timestamp));
    });
  }

  for (const rowOfExpectedOutput of rowsOfExpectedOutput) {
    const { accountId, txType } = rowOfExpectedOutput;
    runTest(accountId, txType)
      // eslint-disable-next-line promise/prefer-await-to-then
      .then((result) => {
        // console.log({ result });
      })
      // eslint-disable-next-line promise/prefer-await-to-then
      .catch((error) => {
        console.error({ error });
      });
  }

  test('overwrite possibleExpectedOutput', async () => {
    const txActionsConverted: TxActionRow[] = [];
    for (const rowOfExpectedOutput of rowsOfExpectedOutput) {
      const { accountId, txType } = rowOfExpectedOutput;
      const file = `${txType}${DOT_SQL}`;
      await addTransactionTypeSqlToDatabase(sqlFolder, file);
      await updateTransactions(accountId, txType, DEFAULT_LENGTH);
      const txActions = await TxActions.find({
        accountId,
        txType,
      }).sort([['block_timestamp', -1]]);

      for (const txAction of txActions) {
        const txActionConverted = convertFromModelToTxActionRow(txAction);
        txActionsConverted.push(txActionConverted);
      }
    }

    // console.log('json', JSON.stringify(txActionsConverted, null, 2));
    jsonToCsv(txActionsConverted);
    console.log(
      "If you overwrite `expectedOutput.csv` via `cp backend/test_helpers/internal/possibleExpectedOutput.csv backend/test_helpers/expectedOutput.csv`, the tests will pass. Obviously, you'll need to manually check whether those values are accurate.",
    );
    expect(true).toEqual(true);
  });
});
