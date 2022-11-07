// Run via `yarn test shared/helpers/datetime.test.ts`

// https://jestjs.io/docs/getting-started#using-typescript
import dayjs from 'dayjs';

import { getEndOfDayUtc, getRelativeTimeOrUtc, getStartOfDayUtc } from './datetime';

describe('datetime helper', () => {
  test('getRelativeTimeOrUtc', () => {
    expect(getRelativeTimeOrUtc('')).toBe('');
    const sometimeLongAgo = '2000-01-01 00:00:00 UTC';
    expect(getRelativeTimeOrUtc(sometimeLongAgo)).toBe(sometimeLongAgo);
    expect(getRelativeTimeOrUtc(dayjs().subtract(2, 'day').toISOString())).toBe('2 days ago');
  });

  test('getStartOfDayUtc', () => {
    expect(getStartOfDayUtc(dayjs.utc('2022-10-01 08:00').toDate()).toISOString()).toEqual('2022-10-01T00:00:00.000Z');
    expect(getStartOfDayUtc(dayjs.utc('2022-10-01 22:00').toDate()).toISOString()).toEqual('2022-10-01T00:00:00.000Z');
    expect(getStartOfDayUtc(dayjs.utc('2022-10-01 23:30').toDate()).toISOString()).toEqual('2022-10-01T00:00:00.000Z');
  });

  test('getEndOfDayUtc', () => {
    expect(getEndOfDayUtc(dayjs.utc('2022-10-01 08:00').toDate()).toISOString()).toEqual('2022-10-01T23:59:59.999Z');
    expect(getEndOfDayUtc(dayjs.utc('2022-10-01 22:00').toDate()).toISOString()).toEqual('2022-10-01T23:59:59.999Z');
    expect(getEndOfDayUtc(dayjs.utc('2022-10-01 23:30').toDate()).toISOString()).toEqual('2022-10-01T23:59:59.999Z');
  });
});
