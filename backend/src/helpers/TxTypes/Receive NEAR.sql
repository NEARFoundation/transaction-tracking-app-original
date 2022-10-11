SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       r.originated_from_transaction_hash transaction_hash,
       ra.args ->>'deposit' amount_transferred,
       'NEAR' currency_transferred,
       r.receiver_account_id receiver_owner_account
FROM receipts r
    INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.receiver_account_id = $1
  AND e.status = 'SUCCESS_VALUE'
  AND ra.action_kind = 'TRANSFER'
  AND r.predecessor_account_id != 'system'
  AND b.block_timestamp > $2
ORDER BY b.block_timestamp LIMIT $3
