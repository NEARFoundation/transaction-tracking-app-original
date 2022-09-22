// https://jestjs.io/docs/getting-started#using-typescript

import exactMath from 'exact-math'; // https://www.npmjs.com/package/exact-math
import { NEAR } from 'near-units'; // https://github.com/near/units-js
import { roundAsLocaleStringWithUnitLabel, round, getDenominator, getUnitLabel } from './nearUnits';

describe('nearUnits', () => {
  console.log('temp', exactMath.pow(10, 24, true));
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

  /*
  test('roundAsLocaleStringWithUnitLabel', () => {
    const cases = {
      '19986790304670292625563': 'TODO',
      '9993575646028206228514': 'TODO',
      '4500000000': 'TODO',
    };
    Object.keys(cases).forEach((key) => {
      expect(roundAsLocaleStringWithUnitLabel(key)).toBe(cases[key]);
    });
  });

  test('roundAsLocaleStringWithUnitLabel custom power and decimals', () => {
    const cases = {
      '19986790304670292625563': '19,986,790,304.67',
      '9993575646028206228514': 'TODO',
      '4500000000': 'TODO',
    };
    Object.keys(cases).forEach((key) => {
      const power = -6;
      const decimals = 2;
      expect(roundAsLocaleStringWithUnitLabel(key, power, decimals)).toBe(cases[key]);
    });

    expect(roundAsLocaleStringWithUnitLabel('1 N', 1, 4)).toBe('1.0000 N'); // TODO: Improve the implementation so that this case passes.
  });*/
});
