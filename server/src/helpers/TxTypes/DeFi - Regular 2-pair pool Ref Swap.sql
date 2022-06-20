SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       ra.args ->'args_json'->>'amount' amount_transferred,
      'wNEAR' currency_transferred,
      ra.args ->'args_json'->>'receiver_id' receiver_owner_account
FROM receipts r
    INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.predecessor_account_id = $1
  AND r.receiver_account_id = 'wrap.near'
  AND e.status = 'SUCCESS_RECEIPT_ID'
  AND ra.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra.args::json->>'method_name', '') = 'ft_transfer_call'
  AND (SELECT count(*) FROM jsonb_object_keys(COALESCE(ra.args::json->'args_json', '{}')::jsonb)) IN (3, 4)
  AND COALESCE((ra.args::json->'args_json')::json->>'amount', '') ~ '^[0-9]+$'
  AND COALESCE((ra.args::json->'args_json')::json->>'receiver_id', '') = 'v2.ref-finance.near'
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
  AND EXISTS(
    SELECT 1
    FROM receipts r4
    INNER JOIN execution_outcomes e4 ON e4.receipt_id = r4.receipt_id
    INNER JOIN action_receipt_actions ra4 ON ra4.receipt_id = r4.receipt_id
    WHERE r4.originated_from_transaction_hash = r.originated_from_transaction_hash
  AND e4.status = 'SUCCESS_VALUE'
  AND r4.predecessor_account_id = COALESCE((ra.args::json->'args_json')::json->>'receiver_id', '')
  AND r4.receiver_account_id = (regexp_match(COALESCE((ra.args::json->'args_json')::json->>'msg', ''), '\\"token_out\\":\\"(.+?)\\"', ''))[1]
  AND ra4.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra4.args::json->>'method_name', '') = 'ft_transfer'
    )
  AND EXISTS(
    SELECT 1
    FROM receipts r5
    INNER JOIN execution_outcomes e5 ON e5.receipt_id = r5.receipt_id
    INNER JOIN action_receipt_actions ra5 ON ra5.receipt_id = r5.receipt_id
    WHERE r5.originated_from_transaction_hash = r.originated_from_transaction_hash
  AND e5.status = 'SUCCESS_VALUE'
  AND r5.predecessor_account_id = COALESCE((ra.args::json->'args_json')::json->>'receiver_id', '')
  AND r5.receiver_account_id = COALESCE((ra.args::json->'args_json')::json->>'receiver_id', '')
  AND ra5.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra5.args::json->>'method_name', '') = 'exchange_callback_post_withdraw'
    )
ORDER BY b.block_timestamp LIMIT $3
