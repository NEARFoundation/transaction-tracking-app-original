SELECT block_timestamp,
originated_from_transaction_hash transaction_hash,
block_height,
args ->> 'deposit' deposit,
args ->> 'args_base64' args_base64
FROM receipts r
INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.predecessor_account_id = $1
AND e.status IN ('SUCCESS_RECEIPT_ID', 'SUCCESS_VALUE')
AND ra.action_kind = 'FUNCTION_CALL'
AND COALESCE(ra.args::json->>'method_name', '') = 'ft_transfer'
AND (SELECT count(*) FROM jsonb_object_keys(COALESCE(ra.args::json->'args_json', '{}')::jsonb)) IN (2, 3)
AND COALESCE((ra.args::json->'args_json')::json->>'amount', '') ~ '^[0-9]+$'
AND COALESCE((ra.args::json->'args_json')::json->>'receiver_id', '') <> ''
AND b.block_timestamp > $2
ORDER BY b.block_timestamp LIMIT $3
