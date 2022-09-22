// TODO: Move this and its tests into https://github.com/near/units-js/ ?

import { NEAR } from 'near-units'; // https://github.com/near/units-js
import exactMath from 'exact-math'; // https://www.npmjs.com/package/exact-math

/**
 *
 * @param yoctonear {string}
 * @param unitLabel {string} e.g. 'yN' for yoctonear, 'N' for near, 'kN' for kilonear, etc https://docs.near.org/tools/near-api-js/utils https://github.com/near/units-js/blob/d0e76d5729b0f3b58b98263a1f92fb057eb84d96/__tests__/near.spec.ts#L13
 * @param decimals {number} e.g. 6 would return 6 decimal places like 0.000000
 * @returns {string} e.g. 1000.000000
 */
export function round(yoctonear: string, unitLabel = 'mN', decimals = 6): string {
  const original = yoctonear.replaceAll('_', '');
  const denominator = NEAR.parse(`1 ${unitLabel}`).toString();
  // console.log(original, denominator);
  const value = exactMath.div(original, denominator);
  // console.log(`round(${original}, power = ${unitLabel}, decimals = ${decimals}) = ${value.toString()}`, denominator.toString());

  return value.toFixed(decimals);
}

/**
 *
 * @param yoctonear {string}
 * @param unitLabel {string} e.g. 'yN' for yoctonear, 'N' for near, 'kN' for kilonear, etc https://docs.near.org/tools/near-api-js/utils https://github.com/near/units-js/blob/d0e76d5729b0f3b58b98263a1f92fb057eb84d96/__tests__/near.spec.ts#L13
 * @param decimals {number} e.g. 6 would return 6 decimal places like 0.000000
 * @returns {string} e.g. 1,000.000000
 */
export function roundAsLocaleString(yoctonear: string, unitLabel = 'mN', decimals = 6): string {
  const value = round(yoctonear, unitLabel, decimals);
  // console.log({ value, unitLabel });
  const localeString = Number(value).toLocaleString(undefined, {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
    //useGrouping: 'auto',
    signDisplay: 'auto',
    minimumFractionDigits: decimals, // Honor decimals precision by padding with extra zeroes if necessary
    maximumFractionDigits: decimals,
  });
  return localeString;
}
