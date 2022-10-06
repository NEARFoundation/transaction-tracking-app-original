import nearApi from 'near-api-js';

import getConfig from '../../../shared/config.js';
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
    const poolsResult = await new nearApi.Account(connection, '').viewFunction('v2.ref-finance.near', 'get_pools', {
      // TODO: Document what this is doing and why it is hard-coded.
      from_index: poolId,
      limit: 1,
    });
    console.log(poolsResult);
    const ftMetadataResult1 = await new nearApi.Account(connection, '').viewFunction(poolsResult[0].token_account_ids[0], 'ft_metadata', {});
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

    const ftMetadataResult2 = await new nearApi.Account(connection, '').viewFunction(poolsResult[0].token_account_ids[1], 'ft_metadata', {});
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

export const getCurrencyByContract = async (fungibleTokenContractAccountId: string): Promise<string> => {
  const currency = await PoolsCurrencies.findOne({ contract: fungibleTokenContractAccountId });
  if (currency) {
    console.log('Found currency', currency.currency);
    return currency.currency;
  } else {
    try {
      const ftMetadataResult = await new nearApi.Account(connection, '').viewFunction(fungibleTokenContractAccountId, 'ft_metadata', {});
      // eslint-disable-next-line promise/valid-params
      await PoolsCurrencies.findOneAndUpdate(
        { contract: fungibleTokenContractAccountId },
        {
          currency: ftMetadataResult.symbol,
          name: ftMetadataResult.name,
          decimals: ftMetadataResult.decimals,
          contract: fungibleTokenContractAccountId,
        },
        { upsert: true },
      );
      console.log('Get currency', ftMetadataResult.symbol);
      return ftMetadataResult.symbol;
    } catch (error) {
      console.error({ nearApi, error });
    }

    return '';
  }
};
