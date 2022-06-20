SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       a.transaction_hash,
       ra.args ->'args_json'->>'amount' amount_transferred,
       'NEAR' currency_transferred,
       r.receiver_account_id receiver_owner_account
FROM receipts r
    INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN transaction_actions a ON a.transaction_hash = r.originated_from_transaction_hash
    INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.receiver_account_id = 'near'
  AND e.status = 'SUCCESS_VALUE'
  AND a.action_kind = 'FUNCTION_CALL'
  AND ra.action_kind = 'FUNCTION_CALL'
  AND EXISTS(
    SELECT 1
    FROM receipts r2
    INNER JOIN execution_outcomes e2 ON e2.receipt_id = r2.receipt_id
    INNER JOIN action_receipt_actions ra2 ON ra2.receipt_id = r2.receipt_id
    WHERE r2.originated_from_transaction_hash = r.originated_from_transaction_hash
  AND r2.receiver_account_id = $1
  AND ra2.action_kind = 'CREATE_ACCOUNT'
  AND e2.status = 'SUCCESS_VALUE'
    )
  AND b.block_timestamp > $2
  AND COALESCE(a.args::json->>'method_name', '') = 'create_account'
  AND COALESCE(ra.args::json->>'method_name', '') = 'on_account_created'
  AND COALESCE((a.args::json->'args_json')::json->>'new_account_id', '') = $1
ORDER BY b.block_timestamp LIMIT $3
