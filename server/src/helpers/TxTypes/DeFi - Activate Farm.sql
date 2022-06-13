SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       r.originated_from_transaction_hash,
       ra.args ->>'deposit' amount_transferred,
       'NEAR' currency_transferred,
       r.receiver_account_id receiver_owner_account
FROM receipts r
    INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.predecessor_account_id = $1
  AND r.receiver_account_id = 'v2.ref-farming.near'
  AND e.status = 'SUCCESS_VALUE'
  AND ra.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra.args::json->>'method_name', '') = 'storage_deposit'
  AND COALESCE((ra.args::json->'args_json')::json->>'account_id', '') = r.predecessor_account_id
  AND b.block_timestamp > $2
  ORDER BY b.block_timestamp LIMIT $3
