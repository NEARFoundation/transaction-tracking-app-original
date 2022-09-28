import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const schema = new Schema({
    pool: {type: Number, index: true, required: false},
    currency: {type: String, required: true},
    contract: {type: String, index: true, required: true},
});

export const PoolsCurrencies = model('PoolsCurrencies', schema, 'PoolsCurrencies');
