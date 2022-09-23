import exactMath from 'exact-math'; // https://www.npmjs.com/package/exact-math
import { Decimal } from 'decimal.js'; // https://github.com/MikeMcl/decimal.js

/**
 *
 * @param amount {string}
 * @param decimals {number} e.g. 6 would return 6 decimal places like 0.000000
 * @param locale {string} e.g. 'en-US' or 'de-DE'
 * @returns {string} e.g. 1,000.000000
 */
export function getLocaleStringToDecimals(amount: string, decimals: any, locale?: string): string {
  // Thanks to https://stackoverflow.com/a/68906367/ because https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt/toLocaleString would not work for huge numbers or numbers with many decimal places.

  const decimalFormat = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const decimalFullString = '1.1';
  const decimalFullNumber = Number.parseFloat(decimalFullString);
  const decimalChar = decimalFormat.format(decimalFullNumber).charAt(1); // e.g. '.' or ','
  const fixed = new Decimal(amount).toFixed(decimals);
  const [mainString, decimalString] = fixed.split('.'); // ['321321321321321321', '357' | '998']
  const mainFormat = new Intl.NumberFormat(locale, { minimumFractionDigits: 0 });
  let mainBigInt = BigInt(mainString); // 321321321321321321n
  const mainFinal = mainFormat.format(mainBigInt); // '321.321.321.321.321.321' | '321.321.321.321.321.322'
  const decimalFinal = typeof decimalString !== 'undefined' ? `${decimalChar}${decimalString}` : ''; // '.357' | '.998'
  const amountFinal = `${mainFinal}${decimalFinal}`; // '321.321.321.321.321.321,36' | '321.321.321.321.321.322,00'
  console.log({
    amount,
    fixed,
    mainString,
    decimalString,
    'decimalString.length': decimalString ? decimalString.length : undefined,
    decimalFormat,
    decimalFinal,
    mainFormat,
    mainBigInt,
    mainFinal,
    amountFinal,
  });
  return amountFinal;
}

/**
 *
 * @param amount {string}
 * @param decimals {number} e.g. 6 would return 6 decimal places like 0.000000
 * @param divisorPower {number} e.g. 0 for yocto, 24 for [base], 27 for kilo, etc https://docs.near.org/tools/near-api-js/utils https://github.com/near/units-js/blob/d0e76d5729b0f3b58b98263a1f92fb057eb84d96/__tests__/near.spec.ts#L13
 * @param locale {string} e.g. 'en-US' or 'de-DE'
 * @returns {string} e.g. 1,000.000000
 */
export function round(amount: string, decimals = 0, divisorPower = 0, locale?: string): string {
  if (divisorPower < 0) {
    throw new Error('divisorPower must be >= 0');
  }
  const amountCleaned = amount.replaceAll('_', '');
  const divisor = Math.pow(10, divisorPower);
  const value: string = exactMath.div(amountCleaned, divisor, { returnString: true });
  // console.log(`round(${amount}, decimals = ${decimals}, divisorPower = ${divisorPower}) = ${value}`, divisor);
  const localeString = getLocaleStringToDecimals(value, decimals, locale);
  return localeString;
}
