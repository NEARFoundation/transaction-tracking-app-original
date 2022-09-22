// TODO: Move this into https://github.com/near/units-js/ ?

import { NEAR } from 'near-units'; // https://github.com/near/units-js
import exactMath from 'exact-math'; // https://www.npmjs.com/package/exact-math

export function getDenominator(unitLabel: string): string {
  const denominator = NEAR.parse(`1 ${unitLabel}`); // TODO
  console.log('denominator', denominator.toString());
  return denominator.toString();
}

/**
 *
 * @param yoctonear {string}
 * @param unitLabel {string} e.g. Use -24 for yoctonear, 1 for near, 3 for kN, etc https://docs.near.org/tools/near-api-js/utils https://github.com/near/units-js/blob/d0e76d5729b0f3b58b98263a1f92fb057eb84d96/__tests__/near.spec.ts#L13
 * @param decimals {number} e.g. 6 would return 6 decimal places like 0.000000
 * @returns {string} e.g. 1000.000001
 */
export function round(yoctonear: string, unitLabel = 'N', decimals = 6): number {
  const original = yoctonear.replaceAll('_', '');
  const denominator = getDenominator(unitLabel);
  const value = exactMath.div(original, denominator);
  // console.log(`round(${original}, power = ${unitLabel}, decimals = ${decimals}) = ${value.toString()}`, denominator.toString());

  return value.toFixed(decimals);
}

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
