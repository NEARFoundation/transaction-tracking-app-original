// https://jestjs.io/docs/getting-started#using-typescript

import { NEAR } from 'near-units'; // https://github.com/near/units-js
import { roundAsLocaleStringWithUnitLabel, round, getDenominator } from './nearUnits';

describe('nearUnits', () => {
  test('getDenominator', () => {
    expect(getDenominator('yN').toString()).toBe('1');
    expect(getDenominator('N').toString()).toBe(NEAR.parse('1 N').toString());
    expect(getDenominator('kN').toString()).toBe(NEAR.parse('1 kN').toString());
  });

  test('round', () => {
    const cases = {
      '4_513_263_875_304_671_192_000_009': '4.513264',
      '19_986_790_304_670_292_625_563': '0.019987',
      '9_993_575_646_028_206_228_514': '0.009994',
      '4_500_000_000': '0.000000',
    };
    Object.keys(cases).forEach((key) => {
      expect(round(key)).toBe(cases[key]);
    });
  });

  test('roundAsLocaleStringWithUnitLabel', () => {
    const cases = {
      '4_513_263_875_304_671_192_000_009': '4.513264 N',
      '19_986_790_304_670_292_625_563': '0.019987 N',
      '9_993_575_646_028_206_228_514': '0.009994 N',
      // TODO '4_500_000_000': '0.000000 N',// TODO: Honor decimals precision by padding with extra zeroes if necessary
      '9999_513_263_875_304_671_192_000_009': '9,999.513264 N',
    };
    Object.keys(cases).forEach((key) => {
      expect(roundAsLocaleStringWithUnitLabel(key)).toBe(cases[key]);
    });
  });

  test('roundAsLocaleStringWithUnitLabel custom power and decimals', () => {
    const cases = {
      '19986790304670292625563': '19.99 mN',
      '9993575646028206228514': '9.99 mN',
      '4500000000': '0 mN',
    };
    Object.keys(cases).forEach((key) => {
      const decimals = 2;
      expect(roundAsLocaleStringWithUnitLabel(key, 'mN', decimals)).toBe(cases[key]);
    });

    // expect(roundAsLocaleStringWithUnitLabel('1 N', 'mN', 4)).toBe('0.0001 mN'); // TODO
  });
});
