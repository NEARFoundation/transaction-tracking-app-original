import { convertAmount } from '../../../shared/helpers/precision.js';
import { type PoolsCurrency } from '../../../shared/types';
import { PoolsCurrencies } from '../models/PoolsCurrencies.js';

/**
 * TODO: Document what this is doing and why. Consider renaming.
 */
async function getDecimals(currency: string): Promise<PoolsCurrency> {
  const decimals = await PoolsCurrencies.findOne({ currency }).select('decimals');
  return decimals;
}

/**
 * TODO: Document what this is doing and why. Consider renaming.
 */
export default async function formatAmount(amount: number | string | undefined, currency: string | undefined): Promise<string> {
  return amount && currency ? await convertAmount(amount, currency, getDecimals) : '';
}
