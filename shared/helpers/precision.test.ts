// https://jestjs.io/docs/getting-started#using-typescript

import { Decimal } from 'decimal.js'; // https://github.com/MikeMcl/decimal.js

import { round, getLocaleStringToDecimals, getBigNumberAsString } from './precision';

type Cases = {
  [key: string]: string;
};

// eslint-disable-next-line max-lines-per-function
describe('precision helper', () => {
  const locale = 'en-US';
  const deDE = 'de-DE';

  test('getLocaleStringToDecimals', () => {
    expect(getLocaleStringToDecimals('4500000000', 1, locale)).toBe('4,500,000,000.0');
    expect(getLocaleStringToDecimals('9000.0000000000004500000000', 15, locale)).toBe('9,000.000000000000450');
    expect(getLocaleStringToDecimals('9000.630', 3, deDE)).toBe('9.000,630');
    expect(getLocaleStringToDecimals(new Decimal('4.5e-12').toFixed(10), 2, locale)).toBe('0.00');
    expect(getLocaleStringToDecimals('4513263875304671192000009.1998679030467029262556391239', 28, locale)).toBe('4,513,263,875,304,671,192,000,009.1998679030467029262556391239');
  });

  test('round (using defaults)', () => {
    // The cases in this test would sometimes fail if not specifying `locale` too, actually, so `undefined` is used below to cause the defaults to be used for those arguments.
    const cases: Cases = {
      '9_999_513_263_875_304_671_192_000_009': '9,999,513,263,875,304,671,192,000,009',
      '4_513_263_875_304_671_192_000_009': '4,513,263,875,304,671,192,000,009',
      '19_986_790_304_670_292_625_563': '19,986,790,304,670,292,625,563',
      '9_993_575_646_028_206_228_514': '9,993,575,646,028,206,228,514',
      '4_500_000_000': '4,500,000,000',
    };
    for (const key of Object.keys(cases)) {
      expect(round(key, undefined, undefined, locale)).toBe(cases[key]);
    }

    expect(round('1', undefined, undefined, locale)).toBe('1');
  });

  test('round custom decimals and divisorPower', () => {
    const cases: Cases = {
      '19_986_790_304_670_292_625_563': '19.99',
      '9_993_575_646_028_206_228_514': '9.99',
      '4_500_000_000': '0.00',
    };
    for (const key of Object.keys(cases)) {
      const decimals = 2;
      const divisorPower = 21;
      expect(round(key, decimals, divisorPower, locale)).toBe(cases[key]);
    }

    expect(round('500_000_000_000_000', 4, 15, locale)).toBe('0.5000');
    expect(round('490', 1, 3, locale)).toBe('0.5');
    expect(round('4_513_263_875_304_671_192_000_009', 6, 21, locale)).toBe('4,513.263875');
    expect(round('4_513_263_875_304_671_192_000_009', 6, 21, deDE)).toBe('4.513,263875');
    expect(round('4_513_263_875_304_671_192_000_009.1998679030467029262556391239', 27, undefined, locale)).toBe('4,513,263,875,304,671,192,000,009.199867903046702926255639124');
  });

  test('getBigNumberAsString', () => {
    // eslint-disable-next-line unicorn/numeric-separators-style
    expect(getBigNumberAsString(1664961079340576500)).toBe('1664961079340576500');
    expect(getBigNumberAsString(1e26)).toBe('100000000000000000000000000');
    expect(getBigNumberAsString(8e28)).toBe('80000000000000000000000000000');
    expect(getBigNumberAsString(undefined)).toBe('');
    expect(getBigNumberAsString(null)).toBe('');
  });
});
