import { Decimal } from 'decimal.js'; // https://github.com/MikeMcl/decimal.js

import { type PoolsCurrency } from '../types';

function getDecimalChar(locale: string | undefined): string {
  const decimalFormat = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const decimalFullString = '1.1';
  const decimalFullNumber = Number.parseFloat(decimalFullString);
  const decimalChar = decimalFormat.format(decimalFullNumber).charAt(1); // e.g. '.' or ','
  return decimalChar;
}

export function getBigNumberAsString(number: number | null | undefined): string {
  if (number) {
    Decimal.set({ precision: 1_000 }); // https://mikemcl.github.io/decimal.js/#precision // TODO: What precision should we use?
    const decimal = new Decimal(`${number}`);
    return decimal.toFixed(0);
  } else {
    return '';
  }
}

/**
 *
 * @param amount {string}
 * @param decimals {number} e.g. 6 would return 6 decimal places like 0.000000
 * @param locale {string} e.g. 'en-US' or 'de-DE'
 * @returns {string} e.g. 1,000.000000
 */
export function getLocaleStringToDecimals(amount: string, decimals: number, locale?: string): string {
  // Thanks to https://stackoverflow.com/a/68906367/ because https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt/toLocaleString would not work for huge numbers or numbers with many decimal places.

  const fixed = new Decimal(amount).toFixed(decimals);
  const [mainString, decimalString] = fixed.split('.'); // ['321321321321321321', '357' | '998']
  const mainFormat = new Intl.NumberFormat(locale, { minimumFractionDigits: 0 });
  const mainBigInt = BigInt(mainString); // 321321321321321321n
  const mainFinal = mainFormat.format(mainBigInt); // '321.321.321.321.321.321' | '321.321.321.321.321.322'
  const decimalFinal = typeof decimalString === 'undefined' ? '' : `${getDecimalChar(locale)}${decimalString}`; // '.357' | '.998'
  const amountFinal = `${mainFinal}${decimalFinal}`; // '321.321.321.321.321.321,36' | '321.321.321.321.321.322,00'
  // console.log({
  //   amount,
  //   fixed,
  //   mainString,
  //   decimalString,
  //   'decimalString.length': decimalString ? decimalString.length : undefined,
  //   decimalFinal,
  //   mainFormat,
  //   mainBigInt,
  //   mainFinal,
  //   amountFinal,
  // });
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
  const divisor = 10 ** divisorPower;
  const precision = amount.length + decimals;
  Decimal.set({ precision }); // https://mikemcl.github.io/decimal.js/#precision
  const value: string = new Decimal(amountCleaned).div(divisor).toFixed(precision);
  // console.log(`round(${amount}, decimals = ${decimals}, divisorPower = ${divisorPower}) = ${value}`, divisor);
  const localeString = getLocaleStringToDecimals(value, decimals, locale);
  return localeString;
}

/**
 * TODO: Document what this is doing and why. Consider removing / moving hard-coded strings.
 *
 * @param {number | string} amount
 * @param {string} currency
 * @returns {string}
 */
export async function convertAmount(amount: number | string, currency: string, getDecimals: (currency: string) => Promise<PoolsCurrency>): Promise<string> {
  const yoctoPower = 24;
  if (currency === 'NEAR' || currency === 'wNEAR') {
    return new Decimal(amount)
      .div(new Decimal(10 ** yoctoPower))
      .toDecimalPlaces(10)
      .toString();
  }

  const decimals = await getDecimals(currency);
  if (decimals?.decimals) {
    return new Decimal(amount)
      .div(new Decimal(10 ** decimals.decimals))
      .toDecimalPlaces(10)
      .toString();
  } else {
    return new Decimal(amount)
      .div(new Decimal(10 ** yoctoPower))
      .toDecimalPlaces(10)
      .toString();
  }
}
