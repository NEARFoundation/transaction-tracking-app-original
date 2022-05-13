import {TxActions} from "../models/TxActions.js";

export const getTransactions = async (req, res) => {
    try {
        const transactions = await TxActions.find({
            accountId: req.query.accountId,
            txType: req.query.txType,
        });
        console.log(transactions);
        res.send({transactions});
    } catch (e) {
        console.log(e);
        res
            .status(500)
            .send({error: 'Please try again'});
    }
}
