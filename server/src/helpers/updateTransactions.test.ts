// Run via `yarn test server/src/helpers/updateTransactions.test.ts`.

// https://jestjs.io/docs/setup-teardown#scoping

import mongoose, { type Mongoose } from 'mongoose';

import { seedTheMockIndexerDatabase } from '../../test_helpers/updateTestData';
import { TxActions } from '../models/TxActions';
import { TxTypes } from '../models/TxTypes';

import { addTransactionTypeSqlToDatabase, DOT_SQL, getSqlFolder } from './addDefaultTypesTx';
import { DEFAULT_LENGTH, mongoConnectionString } from './config';
import { updateTransactions } from './updateTransactions';

// eslint-disable-next-line max-lines-per-function
describe('updateTransactions one at a time', () => {
  /* TODO: Also recreate tests like these but with a beforeAll that calls `await addDefaultTypesTx('./server');` and 
  then the tests ensure that there are no collisions and that transactions get processed.in a mutually exclusive and collectively exhaustive way.*/
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

  // ------------------------------
  /* TODO: This section should be in a loop that first finds all the various transaction types and 
  also which account IDs and transaction hashes (as inputs) map to which expected outputs.*/
  const multisig = 'Multisig - Confirm and execute request';
  const accountId = 'asdf1';

  jest.setTimeout(3_000);
  test(multisig, async () => {
    const file = `${multisig}${DOT_SQL}`;
    await addTransactionTypeSqlToDatabase(sqlFolder, file);
    await updateTransactions(accountId, multisig, DEFAULT_LENGTH);
    const txActions = await TxActions.find({
      accountId,
      multisig,
    }).sort([['block_timestamp', -1]]);
    console.log({ txActions });
    expect(JSON.stringify(txActions)).toBe('TODO');
    expect(JSON.stringify(1)).toBe('TODO');
  });
  // ------------------------------
});
