// https://jestjs.io/docs/getting-started#using-typescript

import exactMath from 'exact-math'; // https://www.npmjs.com/package/exact-math
import { round } from './precision';

describe('precision helper', () => {
  test('exact-math', () => {
    expect(exactMath.div('9999513263875304671192000009', 1, { returnString: true })).toBe('9999513263875304671192000009');
  });

  test('round (using defaults)', () => {
    const cases = {
      '9_999_513_263_875_304_671_192_000_009': '9,999,513,263,875,304,671,192,000,009',
      '4_513_263_875_304_671_192_000_009': '4,513,263,875,304,671,192,000,009',
      '19_986_790_304_670_292_625_563': '19,986,790,304,670,292,625,563',
      '9_993_575_646_028_206_228_514': '9,993,575,646,028,206,228,514',
      '4_500_000_000': '4,500,000,000',
    };
    Object.keys(cases).forEach((key) => {
      expect(round(key)).toBe(cases[key]);
    });
    expect(round('1')).toBe('1');
  });

  test('round custom decimals and divisorPower', () => {
    const cases = {
      '19_986_790_304_670_292_625_563': '19.99',
      '9_993_575_646_028_206_228_514': '9.99',
      '4_500_000_000': '0.00',
    };
    Object.keys(cases).forEach((key) => {
      const decimals = 2;
      const divisorPower = 21;
      expect(round(key, decimals, divisorPower)).toBe(cases[key]);
    });

    expect(round('500_000_000_000_000', 4, 15)).toBe('0.5000');
    expect(round('490', 1, 3)).toBe('0.5');
    expect(round('4_513_263_875_304_671_192_000_009', 6, 21)).toBe('4,513.263875');
  });
});
