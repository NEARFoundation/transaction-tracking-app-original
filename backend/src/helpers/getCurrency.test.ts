// Run via `yarn test backend/src/helpers/getCurrency.test.ts`.
import mongoose, { type Mongoose } from 'mongoose';

import { mongoConnectionString } from './config';
import { getCurrencyByContract } from './getCurrency';

// https://jestjs.io/docs/setup-teardown#scoping

// eslint-disable-next-line max-lines-per-function
describe('getCurrency', () => {
  let connection: Mongoose;

  beforeAll(async () => {
    connection = await mongoose.connect(mongoConnectionString);
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  test('getCurrencyByContract', async () => {
    const result = await getCurrencyByContract('a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near');
    expect(result).toBe('USDC');
  });
});
