SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       ra.args ->'args_json'->>'amount' amount_transferred,
      'NEAR' currency_transferred,
       r.receiver_account_id receiver_owner_account
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
UNION
SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       ra.args ->'args_json'->>'amount' amount_transferred,
      'token' currency_transferred,
      r.receiver_account_id receiver_owner_account
FROM receipts r
    INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.predecessor_account_id = $1
  AND e.status = 'SUCCESS_RECEIPT_ID'
  AND ra.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra.args::json->>'method_name', '') = 'ft_transfer_call'
  AND (SELECT count(*) FROM jsonb_object_keys(COALESCE(ra.args::json->'args_json', '{}')::jsonb)) IN (3, 4)
  AND COALESCE((ra.args::json->'args_json')::json->>'amount', '') ~ '^[0-9]+$'
  AND COALESCE((ra.args::json->'args_json')::json->>'receiver_id', '') NOT IN ('', 'v2.ref-finance.near', 'aurora')
  AND ((ra.args::json->'args_json')::json->'msg') IS NOT NULL
  AND b.block_timestamp > $2
  AND EXISTS(
    SELECT 1
    FROM receipts r2
    INNER JOIN execution_outcomes e2 ON e2.receipt_id = r2.receipt_id
    INNER JOIN action_receipt_actions ra2 ON ra2.receipt_id = r2.receipt_id
    WHERE r2.originated_from_transaction_hash = r.originated_from_transaction_hash
  AND e2.status = 'SUCCESS_VALUE'
  AND r2.predecessor_account_id = r.receiver_account_id
  AND r2.receiver_account_id = COALESCE((ra.args::json->'args_json')::json->>'receiver_id', '')
  AND ra2.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra2.args::json->>'method_name', '') = 'ft_on_transfer'
    )
  AND EXISTS(
    SELECT 1
    FROM receipts r3
    INNER JOIN execution_outcomes e3 ON e3.receipt_id = r3.receipt_id
    INNER JOIN action_receipt_actions ra3 ON ra3.receipt_id = r3.receipt_id
    WHERE r3.originated_from_transaction_hash = r.originated_from_transaction_hash
  AND e3.status = 'SUCCESS_VALUE'
  AND r3.predecessor_account_id = r.receiver_account_id
  AND r3.receiver_account_id = r.receiver_account_id
  AND ra3.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra3.args::json->>'method_name', '') = 'ft_resolve_transfer'
    )
ORDER BY block_timestamp LIMIT $3
