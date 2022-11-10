// Run via `yarn test shared/helpers/datetime.test.ts`

// https://jestjs.io/docs/getting-started#using-typescript
import dayjs from 'dayjs';

import { getEndOfDayUtc, getRelativeTimeOrUtc, getStartOfDayUtc, treatLocalDateAsUtcMidnight, treatUtcMidnightAsLocalDate } from './datetime';

// eslint-disable-next-line max-lines-per-function
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

  test('treatLocalDateAsUtcMidnight', () => {
    expect(treatLocalDateAsUtcMidnight(new Date(Date.parse('2022-10-01 08:00 GMT-0400'))).toISOString()).toEqual('2022-10-01T00:00:00.000Z');
    expect(treatLocalDateAsUtcMidnight(new Date(Date.parse('2022-10-01 22:00 GMT-0400'))).toISOString()).toEqual('2022-10-01T00:00:00.000Z');
    expect(treatLocalDateAsUtcMidnight(new Date(Date.parse('2022-10-01 23:30 GMT-0400'))).toISOString()).toEqual('2022-10-01T00:00:00.000Z');
    expect(treatLocalDateAsUtcMidnight(new Date(Date.parse('2022-09-01 01:30 GMT-0400'))).toISOString()).toEqual('2022-09-01T00:00:00.000Z');
    expect(treatLocalDateAsUtcMidnight(new Date(Date.parse('2022-09-01 20:00 GMT-0400'))).toISOString()).toEqual('2022-09-01T00:00:00.000Z');
    expect(treatLocalDateAsUtcMidnight(new Date(Date.parse('2022-09-01 20:00 GMT-0400'))).toISOString()).toEqual('2022-09-01T00:00:00.000Z');
    expect(treatLocalDateAsUtcMidnight(new Date(Date.parse('2022-09-02 00:00 GMT-0400'))).toISOString()).toEqual('2022-09-02T00:00:00.000Z');
  });

  test('treatUtcMidnightAsLocalDate', () => {
    const testMoment = dayjs.utc('2022-10-01 00:00');
    const zone = dayjs.tz.guess(); // https://day.js.org/docs/en/timezone/guessing-user-timezone
    const local = testMoment.tz(zone, true);
    expect(treatUtcMidnightAsLocalDate(testMoment.toDate()).toISOString()).toEqual(local.toISOString());
  });
});
