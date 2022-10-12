import * as nearAPI from 'near-api-js'; // https://docs.near.org/tools/near-api-js/quick-reference#import

import getConfig from '../../../shared/config.js';
import { type AccountId } from '../../../shared/types/index.js';
import { getNearApiConnection } from '../helpers/nearConnection.js';
import { PoolsCurrencies } from '../models/PoolsCurrencies.js';

const nearConfig = getConfig(process.env.NODE_ENV);

const { nodeUrl } = nearConfig;

const connection = getNearApiConnection(nodeUrl);

/**
 * TODO: Document what this is doing.
 *
 * @param {number} poolId
 * @returns {Promise<[string, string]>}
 */
// eslint-disable-next-line max-lines-per-function
export const getCurrencyByPool = async (poolId: number): Promise<[string, string]> => {
  const currency1 = await PoolsCurrencies.findOne({ pool: poolId, token_account: 1 });
  const currency2 = await PoolsCurrencies.findOne({ pool: poolId, token_account: 2 });
  if (currency1 && currency2) {
    return [currency1.currency, currency2.currency];
  } else {
    const poolsResult = await new nearAPI.Account(connection, '').viewFunction('v2.ref-finance.near', 'get_pools', {
      // TODO: Document what this is doing and why it is hard-coded.
      from_index: poolId,
      limit: 1,
    });
    console.log(poolsResult);
    const ftMetadataResult1 = await new nearAPI.Account(connection, '').viewFunction(poolsResult[0].token_account_ids[0], 'ft_metadata', {});
    // eslint-disable-next-line promise/valid-params
    await PoolsCurrencies.findOneAndUpdate(
      { pool: poolId },
      {
        pool: poolId,
        currency: ftMetadataResult1.symbol,
        name: ftMetadataResult1.name,
        decimals: ftMetadataResult1.decimals,
        contract: poolsResult[0].token_account_ids[0],
        token_account: 1,
      },
      { upsert: true },
    )
      .then()
      .catch((error) => console.error(error));

    const ftMetadataResult2 = await new nearAPI.Account(connection, '').viewFunction(poolsResult[0].token_account_ids[1], 'ft_metadata', {});
    try {
      await PoolsCurrencies.findOneAndUpdate(
        { pool: poolId, contract: poolsResult[0].token_account_ids[1] },
        {
          pool: poolId,
          currency: ftMetadataResult2.symbol,
          contract: poolsResult[0].token_account_ids[1],
          name: ftMetadataResult2.name,
          decimals: ftMetadataResult2.decimals,
          token_account: 2,
        },
        { upsert: true },
      );
    } catch (error) {
      console.error(error);
    }

    return [ftMetadataResult1.symbol, ftMetadataResult2.symbol];
  }
};

async function getCurrencyByContractFromNear(fungibleTokenContractAccountId: AccountId): Promise<{ decimals: any; name: string; symbol: string }> {
  const ftMetadataResult = await new nearAPI.Account(connection, '').viewFunction(fungibleTokenContractAccountId, 'ft_metadata', {});
  const { symbol, name, decimals } = ftMetadataResult;
  return { symbol, name, decimals };
}

export const getCurrencyByContract = async (fungibleTokenContractAccountId: AccountId): Promise<string> => {
  // console.log('getCurrencyByContract', fungibleTokenContractAccountId);
  const currency = await PoolsCurrencies.findOne({ contract: fungibleTokenContractAccountId });
  if (currency) {
    // console.log('Found currency', currency.currency);
    return currency.currency;
  } else {
    try {
      console.log('Using near-api-js to check for the FT symbol for contract', fungibleTokenContractAccountId);
      const { symbol, name, decimals } = await getCurrencyByContractFromNear(fungibleTokenContractAccountId);
      // eslint-disable-next-line promise/valid-params
      await PoolsCurrencies.findOneAndUpdate(
        { contract: fungibleTokenContractAccountId },
        {
          currency: symbol,
          name,
          decimals,
          contract: fungibleTokenContractAccountId,
        },
        { upsert: true },
      );
      console.log('Get currency symbol', symbol);
      return symbol;
    } catch (error) {
      console.error({ nearAPI, error });
    }

    return '';
  }
};
