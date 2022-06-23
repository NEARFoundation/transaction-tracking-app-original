import {PoolsCurrencies} from "../models/PoolsCurrencies.js";
import nearApi from "near-api-js";

const NEAR_RPC_URL = 'https://rpc.mainnet.near.org';
const connectionInfo = {url: NEAR_RPC_URL};
const provider = new nearApi.providers.JsonRpcProvider(connectionInfo);
const connection = new nearApi.Connection(NEAR_RPC_URL, provider, {});

export const getCurrencyByPool = async (pool_id) => {
    const currency1 = await PoolsCurrencies.findOne({pool: pool_id, token_account: 1});
    const currency2 = await PoolsCurrencies.findOne({pool: pool_id, token_account: 2});
    if (currency1 && currency2) {
        return [currency1.currency, currency2.currency];
    } else {
        const res_pools = await new nearApi.Account(connection, null).viewFunction('v2.ref-finance.near', 'get_pools', {
            "from_index": pool_id,
            "limit": 1
        });
        const res_symbol1 = await new nearApi.Account(connection, null).viewFunction(res_pools[0].token_account_ids[0], 'ft_metadata', {});
        await PoolsCurrencies.findOneAndUpdate({pool: pool_id, contract: res_pools[0].token_account_ids[0]}, {
                pool: pool_id,
                currency: res_symbol1.symbol,
                contract: res_pools[0].token_account_ids[0],
                token_account: 1,
            }, {upsert: true}
        ).then().catch(e => console.log(e));

        const res_symbol2 = await new nearApi.Account(connection, null).viewFunction(res_pools[0].token_account_ids[1], 'ft_metadata', {});
        await PoolsCurrencies.findOneAndUpdate({pool: pool_id, contract: res_pools[0].token_account_ids[1]}, {
                pool: pool_id,
                currency: res_symbol2.symbol,
                contract: res_pools[0].token_account_ids[1],
                token_account: 2,
            }, {upsert: true}
        ).then().catch(e => console.log(e));

        return [res_symbol1.symbol, res_symbol2.symbol];
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
