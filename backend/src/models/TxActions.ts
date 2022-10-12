import mongoose from 'mongoose';

import { getFormattedDatetimeUtcFromBlockTimestamp } from '../../../shared/helpers/datetime.js';
import { getBigNumberAsString } from '../../../shared/helpers/precision.js';
import { type AccountId, type TxActionModel, type TxActionRow } from '../../../shared/types';

const { Schema, model } = mongoose;

const schema = new Schema({
  accountId: { type: String, index: true, required: true },
  txType: { type: String, index: true, required: true },
  block_timestamp: { type: mongoose.Schema.Types.Decimal128, index: true },
  from_account: { type: String },
  block_height: { type: Number },
  args_base64: { type: String },
  transaction_hash: { type: String },
  amount_transferred: { type: String },
  currency_transferred: { type: String },
  amount_transferred2: { type: String },
  currency_transferred2: { type: String },
  receiver_owner_account: { type: String },
  receiver_lockup_account: { type: String },
  lockup_start: { type: String },
  lockup_duration: { type: String },
  cliff_duration: { type: String },
  release_duration: { type: String },
});

export const TxActions = model('TxActions', schema, 'TxActions');

// -----------------------------------------------------------------------------------------------
// TODO: Figure out these functions. Reduce duplication with functions elsewhere.
export function convertFromModelToTxActionRow(txActionModel: TxActionModel): TxActionRow {
  return {
    accountId: txActionModel.accountId ?? '',
    txType: txActionModel.txType ?? '',
    block_timestamp: Number(txActionModel.block_timestamp) ?? null, // backend/src/models/TxActions.js uses Decimal128 for this field, which React can't display. https://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-34-decimal.html
    block_timestamp_utc: txActionModel.block_timestamp ? getFormattedDatetimeUtcFromBlockTimestamp(txActionModel.block_timestamp) : '',
    from_account: txActionModel.from_account ?? '',
    block_height: txActionModel.block_height ?? null,
    args_base64: txActionModel.args_base64 ?? '',
    transaction_hash: txActionModel.transaction_hash ?? '',
    amount_transferred: txActionModel.amount_transferred ?? '',
    currency_transferred: txActionModel.currency_transferred ?? '',
    amount_transferred2: txActionModel.amount_transferred2 ?? '',
    currency_transferred2: txActionModel.currency_transferred2 ?? '',
    receiver_owner_account: txActionModel.receiver_owner_account ?? '',
    receiver_lockup_account: txActionModel.receiver_lockup_account ?? '',
    lockup_start: txActionModel.lockup_start ?? '',
    lockup_duration: txActionModel.lockup_duration ?? '',
    cliff_duration: txActionModel.cliff_duration ?? '',
    release_duration: txActionModel.release_duration ?? '',
  };
}

export function getTxActionModel(accountId: AccountId, txType: string, transaction: TxActionRow): TxActionModel {
  return {
    accountId,
    txType,
    block_timestamp: transaction.block_timestamp,
    from_account: transaction.from_account,
    block_height: transaction.block_height,
    args_base64: transaction.args_base64,
    transaction_hash: transaction.transaction_hash,
    amount_transferred: transaction.amount_transferred,
    currency_transferred: transaction.currency_transferred,
    amount_transferred2: transaction.amount_transferred2,
    currency_transferred2: transaction.currency_transferred2,
    receiver_owner_account: transaction.receiver_owner_account,
    receiver_lockup_account: transaction.receiver_lockup_account,
    lockup_start: transaction.lockup_start,
    lockup_duration: transaction.lockup_duration,
    cliff_duration: transaction.cliff_duration,
    release_duration: transaction.release_duration,
  };
}

export function cleanExpectedOutputFromCsv(row: any): any {
  const result = { ...row };
  // eslint-disable-next-line canonical/id-match
  result.amount_transferred = getBigNumberAsString(result.amount_transferred);
  // eslint-disable-next-line canonical/id-match
  result.amount_transferred2 = getBigNumberAsString(result.amount_transferred2);
  return result;
}
// -----------------------------------------------------------------------------------------------
