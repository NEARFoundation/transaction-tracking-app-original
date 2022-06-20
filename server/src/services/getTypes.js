import {TxTypes} from "../models/TxTypes.js";

export const getTypes = async (req, res) => {
    try {
        const types = await TxTypes.aggregate(
            [
                {
                    "$project": {
                        "_id": 0,
                        "label": "$name",
                        "value": "$name"
                    }
                }
            ]);
        //console.log(types);
        res.send({types});
    } catch (e) {
        console.log(e);
        res
            .status(500)
            .send({error: 'Please try again'});
    }
}
