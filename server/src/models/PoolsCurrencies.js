import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const schema = new Schema({
    pool: {type: Number, index: true, required: false},
    contract: {type: String, index: true, required: true},
    token_account: {type: Number, required: false},
    currency: {type: String, required: true},
});

export const PoolsCurrencies = model('PoolsCurrencies', schema, 'PoolsCurrencies');
