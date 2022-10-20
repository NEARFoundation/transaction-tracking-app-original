// Run via `yarn test shared/helpers/datetime.test.ts`

// https://jestjs.io/docs/getting-started#using-typescript
import dayjs from 'dayjs';

import { getRelativeTimeOrUtc } from './datetime';

describe('datetime helper', () => {
  test('getRelativeTimeOrUtc', () => {
    expect(getRelativeTimeOrUtc('')).toBe('');
    const sometimeLongAgo = '2000-01-01 00:00:00 UTC';
    expect(getRelativeTimeOrUtc(sometimeLongAgo)).toBe(sometimeLongAgo);
    expect(getRelativeTimeOrUtc(dayjs().subtract(2, 'day').toISOString())).toBe('2 days ago');
  });
});
