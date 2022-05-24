import {TxTasks} from "../models/TxTasks.js";
import nearApi from 'near-api-js';

const NEAR_RPC_URL = 'https://rpc.mainnet.near.org';
const connectionInfo = { url: NEAR_RPC_URL };
const provider = new nearApi.providers.JsonRpcProvider(connectionInfo);
const connection = new nearApi.Connection(NEAR_RPC_URL, provider, {});

export const addTasks = async (req, res) => {
    try {
        if (!await accountExists(req.body.accountId)) {
            return res
                .status(400)
                .send({error: 'Account does not exist'});
        }
        TxTasks.findOneAndUpdate({accountId: req.body.accountId},
            {accountId: req.body.accountId}, {upsert: true}).then().catch(e => console.log(e));
        res.send({status: 'ok'});
    } catch (e) {
        console.log(e);
        res.status(500).send({error: e});
    }
}


async function accountExists(accountId) {
    try {
        await new nearApi.Account(connection, accountId).state();
        return true;
    } catch (error) {
        return false;
    }
}

