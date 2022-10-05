// Run via `yarn test server/src/helpers/updateTransactions.test.ts`.

// https://jestjs.io/docs/setup-teardown#scoping

import mongoose, { type Mongoose } from 'mongoose';

import { seedTheMockIndexerDatabase } from '../../test_helpers/updateTestData';
import { TxActions } from '../models/TxActions';
import { TxTypes } from '../models/TxTypes';

import { addDefaultTypesTx } from './addDefaultTypesTx';
import { DEFAULT_LENGTH, mongoConnectionString } from './config';
import { updateTransactions } from './updateTransactions';

describe('updateTransactions', () => {
  let connection: Mongoose;

  beforeAll(async () => {
    connection = await mongoose.connect(mongoConnectionString);
    await addDefaultTypesTx('./server');
    const txTypesCountDocuments = await TxTypes.countDocuments();
    console.log({ txTypesCountDocuments });
    await seedTheMockIndexerDatabase();
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  const multisig = 'Multisig - Confirm and execute request';
  const accountId = 'asdf1';
  jest.setTimeout(3_000);
  test(multisig, async () => {
    await updateTransactions(accountId, multisig, DEFAULT_LENGTH);
    console.log('about to call Mongo');
    const txActions = await TxActions.find({
      accountId,
      multisig,
    }).sort([['block_timestamp', -1]]);
    console.log({ txActions });
    expect(JSON.stringify(txActions)).toBe('TODO');
    expect(JSON.stringify(1)).toBe('TODO');
  });
});
