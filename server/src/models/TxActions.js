import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const schema = new Schema({
    accountId: {type: String, index: true, required: true},
    txType: {type: String, index: true, required: true},
    block_timestamp: {type: mongoose.Schema.Types.Decimal128, index: true},
    from_account: {type: String},
    block_height: {type: Number},
    args_base64: {type: String},
    transaction_hash: {type: String},
    amount_transferred: {type: String},
    currency_transferred: {type: String},
    amount_transferred2: {type: String},
    currency_transferred2: {type: String},
    receiver_owner_account: {type: String},
    receiver_lockup_account: {type: String},
    lockup_start: {type: String},
    lockup_duration: {type: String},
    cliff_duration: {type: String},
    release_duration: {type: String},
});

export const TxActions = model('TxActions', schema, 'TxActions');
