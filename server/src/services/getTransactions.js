import {TxActions} from "../models/TxActions.js";
import {TxTasks} from "../models/TxTasks.js";


export const getTransactions = async (req, res) => {
    try {
        console.log(req.body.endDate);
        let filter = {
            accountId: req.body.accountId,
            block_timestamp: {
                $gte: Math.floor(new Date(req.body.startDate).getTime()) * 1000000,
                $lte: Math.floor(new Date(req.body.endDate).getTime()) * 1000000
            }
        };
        if (req.body.types.length > 0) filter = {...filter, txType: req.body.types};
        const transactions = await TxActions.find(filter).sort({block_timestamp: -1});
        const task = await TxTasks.findOne({accountId: req.body.accountId}).select({"_id": 0});

        const transactions2 = [];
        transactions.map((tr) => {
            transactions2.push({
                transaction_hash: tr.transaction_hash,
                accountId: tr.accountId,
                txType: tr.txType,
                args_base64: tr.args_base64,
                deposit: tr.deposit,
                block_timestamp: tr.block_timestamp.toString(),
            });
        })

        res.send({transactions: transactions2, lastUpdate: task.lastUpdate});
    } catch (e) {
        console.log(e);
        res
            .status(500)
            .send({error: 'Please try again'});
    }
}
