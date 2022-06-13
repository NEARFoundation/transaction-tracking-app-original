import mongoose from 'mongoose';

const {Schema, model} = mongoose;

const schema = new Schema({
    accountId: {
        type: String,
        index: true,
        required: true,
        unique: true,
    },
    lastUpdate: {
        type: Number,
        default: 0,
    },
});

export const TxTasks = model('TxTasks', schema, 'TxTasks');
