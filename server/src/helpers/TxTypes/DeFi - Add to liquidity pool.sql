SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       ra.args ->'args_json'->'amounts'->>1 amount_transferred,
       ra.args ->'args_json'->'amounts'->>0 amount_transferred2,
       'wNEAR' currency_transferred,
       ra.args ->'args_json'->>'pool_id' pool_id,
       r.receiver_account_id receiver_owner_account
FROM receipts r
    INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.predecessor_account_id = $1
  AND r.receiver_account_id = 'v2.ref-finance.near'
  AND e.status = 'SUCCESS_VALUE'
  AND ra.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra.args::json->>'method_name', '') = 'add_liquidity'
  AND (SELECT count(*) FROM jsonb_object_keys(COALESCE(ra.args::json->'args_json', '{}')::jsonb)) IN (2, 3)
  AND COALESCE((ra.args::json->'args_json')::json->>'pool_id', '') ~ '^[0-9]+$'
  AND json_array_length(((ra.args::json->'args_json')::json->'amounts')) = 2
  AND b.block_timestamp > $2
ORDER BY b.block_timestamp LIMIT $3
