// TODO: Move this into https://github.com/near/units-js/ ?

import { NEAR } from 'near-units'; // https://github.com/near/units-js
import BN from 'bn.js'; // https://github.com/indutny/bn.js

export function getDenominator(unitLabel: string): NEAR {
  const denominator = NEAR.parse(`1 ${unitLabel}`); // TODO
  console.log('denominator', denominator.toString());
  return denominator;
}

/**
 *
 * @param yoctonear {string}
 * @param unitLabel {string} e.g. Use -24 for yoctonear, 1 for near, 3 for kN, etc https://docs.near.org/tools/near-api-js/utils https://github.com/near/units-js/blob/d0e76d5729b0f3b58b98263a1f92fb057eb84d96/__tests__/near.spec.ts#L13
 * @param decimals {number} e.g. 6 would return 6 decimal places like 0.000000
 * @returns {BN} e.g. 1000.000001
 */
export function round(yoctonear: string, unitLabel = 'N', decimals = 6): BN {
  //console.log('temp', NEAR.parse('4_513_263_875_304_671_192_000_009 yN').div(NEAR.parse('1 N')).toHuman());
  console.log('temp', new BN('4513263875304671192000009').div(new BN('1000000000000000000000000')));
  // const original = NEAR.parse(`${yoctonear} yN`);
  // const denominator = getDenominator(unitLabel);
  const original = new BN(yoctonear.replaceAll('_', ''), 10);
  const denominator = getDenominator(unitLabel);
  const value = original.div(denominator);
  console.log(denominator.toString(), value.toString());
  console.log(`round(${original}, power = ${unitLabel}, decimals = ${decimals}) = ${value.toString()}`, denominator.toString());
  // TODO Honor decimals precision
  return value;
}

// export function getUnitLabel(power: number): string {
//   const near = NEAR.parse('1 N');
//   const denominator = getDenominator(power);
//   const divided = near.div(denominator);
//   const dividedStr = divided.toString();
//   console.log(near.toString(), denominator.toString(), { dividedStr });
//   return dividedStr.replace('1 ', '');
// }

/**
 *
 * @param yoctonear {string}
 * @param unitLabel {string} e.g. Use -24 for yoctonear, 1 for near, 3 for kN, etc https://docs.near.org/tools/near-api-js/utils https://github.com/near/units-js/blob/d0e76d5729b0f3b58b98263a1f92fb057eb84d96/__tests__/near.spec.ts#L13
 * @param decimals {number} e.g. 6 would return 6 decimal places like 0.000000
 * @returns {string} e.g. 1,000.000000 N
 */
export function roundAsLocaleStringWithUnitLabel(yoctonear: string, unitLabel = 'N', decimals = 6): string {
  const value = round(yoctonear, unitLabel, decimals);
  console.log({ value, unitLabel });
  // TODO: Honor decimals precision by padding with extra zeroes if necessary
  return `${value.toLocaleString()} ${unitLabel}`;
}
