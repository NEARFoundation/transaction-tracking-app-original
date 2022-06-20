SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       ra.args ->'args_json'->'min_amounts'->>1 amount_transferred,
       ra.args ->'args_json'->'min_amounts'->>0 amount_transferred2,
       'wNEAR' currency_transferred,
       ra.args ->'args_json'->>'pool_id' pool_id,
       r.receiver_account_id receiver_owner_account
FROM receipts r
    INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.predecessor_account_id = $1
  AND r.receiver_account_id = 'v2.ref-finance.near'
  AND e.status = 'SUCCESS_RECEIPT_ID'
  AND ra.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra.args::json->>'method_name', '') = 'remove_liquidity'
  AND (SELECT count(*) FROM jsonb_object_keys(COALESCE(ra.args::json->'args_json', '{}')::jsonb)) = 3
  AND COALESCE((ra.args::json->'args_json')::json->>'pool_id', '') ~ '^[0-9]+$'
  AND COALESCE((ra.args::json->'args_json')::json->>'shares', '') ~ '^[0-9]+$'
  AND json_array_length(((ra.args::json->'args_json')::json->'min_amounts')) = 2
  AND b.block_timestamp > $2
  AND (
    SELECT count(*)
    FROM action_receipt_actions ra2
    WHERE ra2.receipt_id = r.receipt_id
  AND ra2.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra2.args::json->>'method_name', '') = 'withdraw'
    ) = 2
  AND (
    SELECT count(*)
    FROM receipts r3
    INNER JOIN execution_outcomes e3 ON e3.receipt_id = r3.receipt_id
    INNER JOIN action_receipt_actions ra3 ON ra3.receipt_id = r3.receipt_id
    WHERE r3.originated_from_transaction_hash = r.originated_from_transaction_hash
  AND e3.status = 'SUCCESS_VALUE'
  AND r3.predecessor_account_id = r.receiver_account_id
  AND r3.receiver_account_id IN (SELECT COALESCE((ra5.args::json->'args_json')::json->>'token_id', '') FROM action_receipt_actions ra5 WHERE ra5.receipt_id = r.receipt_id AND ra5.action_kind = 'FUNCTION_CALL' AND COALESCE(ra5.args::json->>'method_name', '') = 'withdraw')
  AND ra3.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra3.args::json->>'method_name', '') = 'ft_transfer'
  AND COALESCE((ra3.args::json->'args_json')::json->>'receiver_id', '') = r.predecessor_account_id
    ) = 2
  AND (
    SELECT count(*)
    FROM receipts r4
    INNER JOIN execution_outcomes e4 ON e4.receipt_id = r4.receipt_id
    INNER JOIN action_receipt_actions ra4 ON ra4.receipt_id = r4.receipt_id
    WHERE r4.originated_from_transaction_hash = r.originated_from_transaction_hash
  AND e4.status = 'SUCCESS_VALUE'
  AND r4.predecessor_account_id = r.receiver_account_id
  AND r4.receiver_account_id = r.receiver_account_id
  AND ra4.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra4.args::json->>'method_name', '') = 'exchange_callback_post_withdraw'
  AND COALESCE((ra4.args::json->'args_json')::json->>'token_id', '') IN (SELECT COALESCE((ra6.args::json->'args_json')::json->>'token_id', '') FROM action_receipt_actions ra6 WHERE ra6.receipt_id = r.receipt_id AND ra6.action_kind = 'FUNCTION_CALL' AND COALESCE(ra6.args::json->>'method_name', '') = 'withdraw')
  AND COALESCE((ra4.args::json->'args_json')::json->>'sender_id', '') = r.predecessor_account_id
    ) = 2
ORDER BY b.block_timestamp LIMIT $3
