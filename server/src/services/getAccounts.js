import {TxTasks} from "../models/TxTasks.js";
import {TxActions} from "../models/TxActions.js";

export const getAccounts = async (req, res) => {
    try {
        const accounts = [];
        for (const accountId of req.body.accountId) {
            const account = await TxTasks.findOne({accountId: accountId}).select({"_id": 0, "__v": 0});
            const transactions = await TxActions.findOne({accountId: accountId});
            let lastUpdate;
            let status;
            if (!account) {
                status = 'The account is not monitored. Please add the account again';
            } else {
                if (account.lastUpdate === 0) status = 'Pending';
                if (account.isRunning) status = 'In progress';
                else if (transactions) status = 'Done';
                else if (!transactions && account.lastUpdate > 0) status = 'No data';

                if (account.lastUpdate > 0) lastUpdate = new Date(account.lastUpdate).toLocaleString()
            }
            accounts.push({accountId, lastUpdate, status});
        }
        res.send({accounts});
    } catch (e) {
        console.log(e);
        res
            .status(500)
            .send({error: 'Please try again'});
    }
}
