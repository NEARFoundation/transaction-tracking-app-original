import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const schema = new Schema({
    id: {
        type: String, unique: true, index: true
    },
    name: {type: String},
    sql: {type: String},
});

export const TxTypes = model('TxTypes', schema);

