// https://jestjs.io/docs/getting-started#using-typescript

import { NEAR } from 'near-units'; // https://github.com/near/units-js
import { roundAsLocaleString, round } from './nearUnits';

describe('nearUnits', () => {
  test('round', () => {
    const cases = {
      '9999_513_263_875_304_671_192_000_009': '9999513.263875',
      '4_513_263_875_304_671_192_000_009': '4513.263875',
      '19_986_790_304_670_292_625_563': '19.986790',
      '9_993_575_646_028_206_228_514': '9.993576',
      '4_500_000_000': '0.000000',
    };
    Object.keys(cases).forEach((key) => {
      expect(round(key)).toBe(cases[key]);
    });
  });

  test('roundAsLocaleString', () => {
    const cases = {
      '9999_513_263_875_304_671_192_000_009': '9,999,513.263875',
      '4_513_263_875_304_671_192_000_009': '4,513.263875',
      '19_986_790_304_670_292_625_563': '19.986790',
      '9_993_575_646_028_206_228_514': '9.993576',
      '4_500_000_000': '0.000000',
    };
    Object.keys(cases).forEach((key) => {
      expect(roundAsLocaleString(key)).toBe(cases[key]);
    });
  });

  test('roundAsLocaleString custom unitLabel and decimals', () => {
    const cases = {
      '19_986_790_304_670_292_625_563': '19.99',
      '9_993_575_646_028_206_228_514': '9.99',
      '4_500_000_000': '0.00',
    };
    Object.keys(cases).forEach((key) => {
      const decimals = 2;
      expect(roundAsLocaleString(key, 'mN', decimals)).toBe(cases[key]);
    });

    expect(roundAsLocaleString('500_000_000_000_000', 'nN', 4)).toBe('0.5000');
    expect(roundAsLocaleString('490', 'zN', 1)).toBe('0.5');
    expect(roundAsLocaleString('1', 'yN', 0)).toBe('1');
    expect(roundAsLocaleString('4_513_263_875_304_671_192_000_009', 'N', 3)).toBe('4.513');
  });
});
