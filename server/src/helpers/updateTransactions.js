import pg from 'pg';
import {TxActions} from "../models/TxActions.js";
import {TxTypes} from "../models/TxTypes.js";
import {TxTasks} from "../models/TxTasks.js";

let IsRun = 0;

export const runTasks = async () => {
    if (IsRun === 0) {
        try {
            IsRun = 1;
            //await new Promise(resolve => setTimeout(resolve, 1000 * 90));
            let types = await TxTypes.find({});
            let tasks = await TxTasks.find({});
            tasks.map((task) => {
                types.map((type) => {
                    updateTransactions(task.accountId, type.name);
                });
                TxTasks.findOneAndUpdate({accountId: task.accountId}, {lastUpdate: Math.floor(Date.now())}).then().catch(e => console.log(e));
            })
        } catch (e) {
            console.log(e);
        }
        IsRun = 0;
    } else {
        console.log('SyncedCron: runTasks is already running');
    }
}

async function getTransactions(accountId, txType, block_timestamp, length) {
    try {
        const POSTGRESQL_CONNECTION_STRING = process.env.POSTGRESQL_CONNECTION_STRING;
        let TxType = await TxTypes.findOne({name: txType});
        const client = new pg.Client({
            connectionString: POSTGRESQL_CONNECTION_STRING
        });
        if (TxType) {
            console.log(`getTransactions(${accountId}, ${txType}, ${block_timestamp.toString()}, ${length})`);
            await client.connect()
            const res = await client.query(TxType.sql, [accountId, block_timestamp.toString(), length]);
            await client.end();
            return res.rows;
        } else {
            return [];
        }
    } catch (e) {
        console.log(e);
        return [];
    }
}

async function updateTransactions(accountId, txType) {
    console.log(`updateTransactions(${accountId}, ${txType})`);
    let blockTimestamp = 0;
    const length = 100;
    const lastBlockTimestamp = await TxActions.findOne({
        accountId: accountId,
        txType: txType
    }).sort([['block_timestamp', -1]]);
    if (lastBlockTimestamp) blockTimestamp = lastBlockTimestamp.block_timestamp;
    let transactions = await getTransactions(accountId, txType, blockTimestamp, length);

    while (transactions.length > 0) {
        transactions.map((item) => {
            console.log('Received: ', item.block_timestamp);
            TxActions.findOneAndUpdate({transaction_hash: item.transaction_hash, txType: txType}, {
                    accountId: accountId,
                    txType: txType,
                    block_timestamp: item.block_timestamp,
                    block_height: item.block_height,
                    args_base64: item.args_base64,
                    transaction_hash: item.transaction_hash,
                    deposit: item.deposit,
                }, {upsert: true}
            ).then().catch(e => console.log(e));
        })

        let nextBlockTimestamp = transactions[transactions.length - 1].block_timestamp;
        let i = 1;
        while (nextBlockTimestamp === blockTimestamp && (transactions.length === length * i)) {
            i++;
            let increasedLength = length * i;
            transactions = await getTransactions(accountId, txType, blockTimestamp, increasedLength);
            nextBlockTimestamp = transactions[transactions.length - 1].block_timestamp;
        }
        if (nextBlockTimestamp === blockTimestamp) {
            break;
        }
        if (i === 1) {
            blockTimestamp = nextBlockTimestamp;
            transactions = await getTransactions(accountId, txType, blockTimestamp, length);
        }
    }
}
