// https://jestjs.io/docs/setup-teardown#scoping

// import { TxActions } from '../models/TxActions';
import { seedTheMockIndexerDatabase as seedTheMockIndexerDatabase } from '../../test_helpers/updateTestData';

import { DEFAULT_LENGTH, updateTransactions } from './updateTransactions';

beforeAll(async () => {
  await seedTheMockIndexerDatabase();
});

test('TODO', async () => {
  await updateTransactions('TODO', 'TODO', DEFAULT_LENGTH);
  // const mostRecentTxAction = await TxActions.findOne({
  //   accountId,
  //   txType,
  // }).sort([['block_timestamp', -1]]);
  // expect(JSON.stringify(mostRecentTxAction)).toBe('TODO');
  expect(JSON.stringify(1)).toBe('TODO');
});

// afterAll(async () => {
//   //
// });
