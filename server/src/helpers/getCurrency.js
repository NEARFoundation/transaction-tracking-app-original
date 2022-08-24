import {PoolsCurrencies} from "../models/PoolsCurrencies.js";
import nearApi from "near-api-js";
import getConfig from '../config.js';

const nearConfig = getConfig(process.env.NODE_ENV || 'development');

const { nodeUrl } = nearConfig;

const connectionInfo = {url: nodeUrl};
const provider = new nearApi.providers.JsonRpcProvider(connectionInfo);
const connection = new nearApi.Connection(nodeUrl, provider, {});

export const getCurrencyByPool = async (pool_id) => {

    const currency = await PoolsCurrencies.findOne({pool: pool_id});
    if (currency) {
        return currency.currency;
    } else {
        const res_pools = await new nearApi.Account(connection, null).viewFunction('v2.ref-finance.near', 'get_pools', {
            "from_index": pool_id,
            "limit": 1
        });
        console.log(res_pools);
        const res_symbol = await new nearApi.Account(connection, null).viewFunction(res_pools[0].token_account_ids[0], 'ft_metadata', {});
        await PoolsCurrencies.findOneAndUpdate({pool: pool_id}, {
                pool: pool_id,
                currency: res_symbol.symbol,
                contract: res_pools[0].token_account_ids[0],
            }, {upsert: true}
        ).then().catch(e => console.log(e));
        return res_symbol.symbol;
    }

}

export const getCurrencyByContract = async (contract) => {

    const currency = await PoolsCurrencies.findOne({contract: contract});
    if (currency) {
        console.log('Found currency', currency.currency);
        return currency.currency;
    } else {
        const res_symbol = await new nearApi.Account(connection, null).viewFunction(contract, 'ft_metadata', {});
        await PoolsCurrencies.findOneAndUpdate({contract: contract}, {
                currency: res_symbol.symbol,
                contract: contract,
            }, {upsert: true}
        ).then().catch(e => console.log(e));
        console.log('Get currency', res_symbol.symbol);
        return res_symbol.symbol;
    }

}