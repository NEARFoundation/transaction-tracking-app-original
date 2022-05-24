import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const schema = new Schema({
    accountId: {
        type: String,
        index: true,
        required: true,
    },
    txType: {
        type: String,
        index: true,
        required: true,
    },
    block_timestamp: {
        type: mongoose.Schema.Types.Decimal128,
        index: true,
    },
    block_height: {
        type: Number,
    },
    deposit: {type: String},
    args_base64: {type: String},
    transaction_hash: {type: String},


});

export const TxActions = model('TxActions', schema);
