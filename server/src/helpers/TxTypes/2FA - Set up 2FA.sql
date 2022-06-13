SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       ra.args ->>'deposit' amount_transferred,
       'NEAR' currency_transferred,
       r.receiver_account_id receiver_owner_account
FROM receipts r
    INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.predecessor_account_id = $1
  AND r.receiver_account_id = r.predecessor_account_id
  AND e.status = 'SUCCESS_VALUE'
  AND ra.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra.args::json->>'method_name', '') = 'new'
  AND COALESCE((ra.args::json->'args_json')::json->>'num_confirmations', '') = '2'
  AND (SELECT count(*) FROM jsonb_object_keys(COALESCE(ra.args::json->'args_json', '{}')::jsonb)) = 1
  AND EXISTS(
    SELECT 1
    FROM receipts r2
    INNER JOIN action_receipt_actions ra2 ON ra2.receipt_id = r2.receipt_id
    WHERE r2.receipt_id = r.receipt_id
  AND ra2.action_kind = 'ADD_KEY'
  AND COALESCE((((ra2.args::json->'access_key')::json->'permission')::json->'permission_details')::json->>'receiver_id', '') = r.predecessor_account_id
  AND COALESCE((((ra2.args::json->'access_key')::json->'permission')::json->'permission_details')::json->>'method_names', '') = '["confirm"]'
    )
  AND EXISTS(
    SELECT 1
    FROM receipts r3
    INNER JOIN action_receipt_actions ra3 ON ra3.receipt_id = r3.receipt_id
    WHERE r3.receipt_id = r.receipt_id
  AND ra3.action_kind = 'DEPLOY_CONTRACT'
    )
  AND b.block_timestamp > $2
ORDER BY b.block_timestamp LIMIT $3
