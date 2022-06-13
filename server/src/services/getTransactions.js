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
                accountId: tr.accountId,
                txType: tr.txType,
                block_timestamp: tr.block_timestamp.toString(),
                from_account: tr.from_account,
                block_height: tr.block_height,
                args_base64: tr.args_base64,
                transaction_hash: tr.transaction_hash,
                amount_transferred: tr.amount_transferred,
                currency_transferred: tr.currency_transferred,
                amount_transferred2: tr.amount_transferred2,
                currency_transferred2: tr.currency_transferred2,
                receiver_owner_account: tr.receiver_owner_account,
                receiver_lockup_account: tr.receiver_lockup_account,
                lockup_start: tr.lockup_start,
                lockup_duration: tr.lockup_duration,
                cliff_duration: tr.cliff_duration,
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
