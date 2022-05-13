import {TxTasks} from "../models/TxTasks.js";
import {TxTypes} from "../models/TxTypes.js";

export const addTask = async (req, res) => {
    try {
        let TxType = await TxTypes.findOne({id: req.query.txType});
        if (TxType) {
            await TxTasks.findOneAndUpdate({
                    accountId: req.query.accountId,
                    txType: req.query.txType,
                }, {
                    accountId: req.query.accountId,
                    txType: req.query.txType,
                }, {upsert: true}
            ).then().catch(e => console.log(e));
            res.send({status: 'ok'});
        }else{
            res.status(500).send({error: 'txType not found'});
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({error: e});
    }
}
