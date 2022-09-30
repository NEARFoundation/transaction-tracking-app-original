import nearApi from 'near-api-js';

import getConfig from '../../../shared/config.js';
import { getNearApiConnection } from '../helpers/nearConnection.js';
import { PoolsCurrencies } from '../models/PoolsCurrencies.js';

const nearConfig = getConfig(process.env.NODE_ENV);

const { nodeUrl } = nearConfig;

const connection = getNearApiConnection(nodeUrl);

export const getCurrencyByPool = async (poolId: number) => {
  const currency = await PoolsCurrencies.findOne({ pool: poolId });
  if (currency) {
    return currency.currency;
  } else {
    const poolsResult = await new nearApi.Account(connection, '').viewFunction('v2.ref-finance.near', 'get_pools', {
      // TODO: Document what this is doing and why it is hard-coded.
      from_index: poolId,
      limit: 1,
    });
    console.log(poolsResult);
    const ftMetadataResult = await new nearApi.Account(connection, '').viewFunction(poolsResult[0].token_account_ids[0], 'ft_metadata', {});
    // eslint-disable-next-line promise/valid-params
    await PoolsCurrencies.findOneAndUpdate(
      { pool: poolId },
      {
        contract: poolsResult[0].token_account_ids[0],
        currency: ftMetadataResult.symbol,
        pool: poolId,
      },
      { upsert: true },
    )
      .then()
      .catch((error) => console.error(error));
    return ftMetadataResult.symbol;
  }
};

export const getCurrencyByContract = async (contract: string) => {
  const currency = await PoolsCurrencies.findOne({ contract });
  if (currency) {
    console.log('Found currency', currency.currency);
    return currency.currency;
  } else {
    const ftMetadataResult = await new nearApi.Account(connection, '').viewFunction(contract, 'ft_metadata', {});
    // eslint-disable-next-line promise/valid-params
    await PoolsCurrencies.findOneAndUpdate(
      { contract },
      {
        contract,
        currency: ftMetadataResult.symbol,
      },
      { upsert: true },
    )
      .then()
      .catch((error) => console.error(error));
    console.log('Get currency', ftMetadataResult.symbol);
    return ftMetadataResult.symbol;
  }
};
