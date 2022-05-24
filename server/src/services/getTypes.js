import {TxTypes} from "../models/TxTypes.js";

export const getTypes = async (req, res) => {
    try {
        const types = await TxTypes.find({}).select({ "name": 1, "_id": 0});
        console.log(types);
        res.send({types});
    } catch (e) {
        console.log(e);
        res
            .status(500)
            .send({error: 'Please try again'});
    }
}
