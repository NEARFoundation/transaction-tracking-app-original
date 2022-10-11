import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const schema = new Schema({
    name: {
        type: String, unique: true, index: true
    },
    sql: {type: String},
});

export const TxTypes = model('TxTypes', schema, 'TxTypes');

