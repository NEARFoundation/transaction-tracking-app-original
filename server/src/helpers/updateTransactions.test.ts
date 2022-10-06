// Run via `yarn test server/src/helpers/updateTransactions.test.ts`.

// https://jestjs.io/docs/setup-teardown#scoping

import mongoose, { type Mongoose } from 'mongoose';

import { type RowOfExpectedOutput } from '../../../shared/types';
import { getRowsOfExpectedOutput } from '../../test_helpers/internal/csvToJson';
import { seedTheMockIndexerDatabase } from '../../test_helpers/internal/updateTestData';
import { TxActions } from '../models/TxActions';
import { TxTypes } from '../models/TxTypes';

import { addTransactionTypeSqlToDatabase, DOT_SQL, getSqlFolder } from './addDefaultTypesTx';
import { DEFAULT_LENGTH, mongoConnectionString } from './config';
import { updateTransactions } from './updateTransactions';

// eslint-disable-next-line max-lines-per-function
describe('updateTransactions', () => {
  let connection: Mongoose;
  let sqlFolder: string;

  beforeAll(async () => {
    connection = await mongoose.connect(mongoConnectionString);
    sqlFolder = getSqlFolder('./server');
    const txTypesCountDocuments = await TxTypes.countDocuments();
    console.log({ txTypesCountDocuments });
    await seedTheMockIndexerDatabase();
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  beforeEach(async () => {
    await TxTypes.deleteMany({});
    await TxActions.deleteMany({});
  });

  jest.setTimeout(3_000);

  const rowsOfExpectedOutput = getRowsOfExpectedOutput();

  console.log({ rowsOfExpectedOutput });

  async function runTest(rowOfExpectedOutput: RowOfExpectedOutput) {
    const { accountId, txType } = rowOfExpectedOutput;
    test(txType, async () => {
      const file = `${txType}${DOT_SQL}`;
      await addTransactionTypeSqlToDatabase(sqlFolder, file);
      await updateTransactions(accountId, txType, DEFAULT_LENGTH);
      const txActions = await TxActions.find({
        accountId,
        txType,
      }).sort([['block_timestamp', -1]]);
      console.log({ txActions });
      expect(JSON.stringify(txActions)).toBe(JSON.stringify(rowOfExpectedOutput));
    });
  }

  for (const rowOfExpectedOutput of rowsOfExpectedOutput) {
    runTest(rowOfExpectedOutput)
      // eslint-disable-next-line promise/prefer-await-to-then
      .then((result) => {
        console.log({ result });
      })
      // eslint-disable-next-line promise/prefer-await-to-then
      .catch((error) => {
        console.error({ error });
      });
  }
});
