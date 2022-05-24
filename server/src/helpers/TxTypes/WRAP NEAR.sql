SELECT block_timestamp,
       originated_from_transaction_hash transaction_hash,
       block_height,
       args ->> 'deposit' deposit,
    args ->> 'args_base64' args_base64
FROM receipts r
    INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.receiver_account_id = 'wrap.near'
  AND r.predecessor_account_id = $1
  AND e.status = 'SUCCESS_VALUE'
  AND ra.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra.args::json->>'method_name', '') = 'near_deposit'
  AND b.block_timestamp > $2
ORDER BY b.block_timestamp LIMIT $3
