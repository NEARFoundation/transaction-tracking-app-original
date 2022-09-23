import exactMath from 'exact-math'; // https://www.npmjs.com/package/exact-math

function getLocaleStringToDecimals(value: number, decimals: number): string {
  return value.toLocaleString(undefined, {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
    //useGrouping: 'auto',
    signDisplay: 'auto',
    minimumFractionDigits: decimals, // Honor decimals precision by padding with extra zeroes if necessary
    maximumFractionDigits: decimals,
  });
}

/**
 *
 * @param original {string}
 * @param decimals {number} e.g. 6 would return 6 decimal places like 0.000000
 * @param divisorPower {number} e.g. 0 for yocto, 24 for [base], 27 for kilo, etc https://docs.near.org/tools/near-api-js/utils https://github.com/near/units-js/blob/d0e76d5729b0f3b58b98263a1f92fb057eb84d96/__tests__/near.spec.ts#L13
 * @returns {string} e.g. 1000.000000
 */
export function round(original: string, decimals = 6, divisorPower = 0): string {
  if (divisorPower < 0) {
    throw new Error('divisorPower must be >= 0');
  }
  const originalCleaned = original.replaceAll('_', '');
  const divisor = Math.pow(10, divisorPower);
  // console.log(original, divisor);
  const value = exactMath.div(originalCleaned, divisor);
  // console.log(`round(${original}, decimals = ${decimals}, divisorPower = ${divisorPower}) = ${value.toString()}`, divisor.toString());

  const localeString = getLocaleStringToDecimals(Number(value), decimals);
  return localeString;
}
