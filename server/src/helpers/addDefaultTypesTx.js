import {TxTypes} from "../models/TxTypes.js";

let NewTxTypes = [];
NewTxTypes.push({
    'id': 'generate_account_and_claim_name',
    'name': 'Generate account & claim name',
    'sql': `SELECT *
            FROM receipts r
                     INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
                     INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
                     INNER JOIN transaction_actions a ON a.transaction_hash = r.originated_from_transaction_hash
            WHERE r.predecessor_account_id = $1
              AND e.status = 'SUCCESS_VALUE'
              AND a.action_kind = 'TRANSFER'
              AND b.block_timestamp > $2
            ORDER BY b.block_timestamp
                LIMIT $3`
});
NewTxTypes.push({
    'id': 'receive_near',
    'name': 'Receive NEAR',
    'sql': `SELECT *
            FROM receipts r
                     INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
                     INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
                     INNER JOIN transaction_actions a ON a.transaction_hash = r.originated_from_transaction_hash
            WHERE r.receiver_account_id = $1
              AND e.status = 'SUCCESS_VALUE'
              AND a.action_kind = 'TRANSFER'
              AND r.predecessor_account_id != 'system'
              AND b.block_timestamp > $2
            ORDER BY b.block_timestamp
                LIMIT $3`
});

NewTxTypes.push({
    'id': 'send_near',
    'name': 'Send NEAR',
    'sql': `SELECT *
            FROM receipts r
                     INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
                     INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
                     INNER JOIN transaction_actions a ON a.transaction_hash = r.originated_from_transaction_hash
            WHERE r.predecessor_account_id = $1
              AND e.status = 'SUCCESS_VALUE'
              AND a.action_kind = 'TRANSFER'
              AND b.block_timestamp > $2
            ORDER BY b.block_timestamp
                LIMIT $3`
});

export const addDefaultTypesTx = async () => {
    NewTxTypes.map((item) => {
        TxTypes.findOneAndUpdate({id: item.id}, {
                id: item.id,
                name: item.name,
                sql: item.sql
            }, {upsert: true}
        ).then().catch(e => console.log(e));
    })
}
