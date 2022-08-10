-- Parameters:
--   Account: newafro.near,
--   Date from: 2020-10-20 12:46:00
--   Date to: 2022-05-07 21:16:00
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
  AND ra.args ->> 'args_json'::text IS NOT NULL
  AND ra.args ->> 'method_name'::text = 'remove_liquidity'
  AND (SELECT count(*) FROM jsonb_object_keys(COALESCE(ra.args -> 'args_json'::text, '{}')::jsonb)) = 3
  AND (ra.args -> 'args_json'::text) ->> 'pool_id'::text ~ '^[0-9]+$'
  AND (ra.args -> 'args_json'::text) ->> 'shares'::text ~ '^[0-9]+$'
  AND json_array_length(((ra.args::json->'args_json')->'min_amounts'::text)) = 2
  AND b.block_timestamp > $2
  AND (
    SELECT count(*)
    FROM action_receipt_actions ra2
    WHERE ra2.receipt_id = r.receipt_id
  AND ra2.action_kind = 'FUNCTION_CALL'
  AND ra2.args ->> 'args_json'::text IS NOT NULL
  AND ra2.args ->> 'method_name'::text = 'withdraw'
    ) = 2
  AND (
    SELECT count(*)
    FROM receipts r3
    INNER JOIN execution_outcomes e3 ON e3.receipt_id = r3.receipt_id
    INNER JOIN action_receipt_actions ra3 ON ra3.receipt_id = r3.receipt_id
    WHERE r3.originated_from_transaction_hash = r.originated_from_transaction_hash
  AND e3.status = 'SUCCESS_VALUE'
  AND r3.predecessor_account_id = r.receiver_account_id
  AND r3.receiver_account_id IN (SELECT COALESCE((ra5.args::json->'args_json')::json->>'token_id', '') FROM action_receipt_actions ra5 WHERE ra5.receipt_id = r.receipt_id AND ra5.action_kind = 'FUNCTION_CALL' AND ra5.args ->> 'args_json'::text IS NOT NULL AND ra5.args ->> 'method_name'::text = 'withdraw')
  AND ra3.action_kind = 'FUNCTION_CALL'
  AND ra3.args ->> 'args_json'::text IS NOT NULL
  AND ra3.args ->> 'method_name'::text = 'ft_transfer'
  AND (ra3.args -> 'args_json'::text) ->> 'receiver_id'::text = r.predecessor_account_id
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
  AND ra4.args ->> 'args_json'::text IS NOT NULL
  AND ra4.args ->> 'method_name'::text = 'exchange_callback_post_withdraw'

  AND (ra4.args -> 'args_json'::text) ->> 'sender_id'::text = r.predecessor_account_id
  AND COALESCE((ra4.args -> 'args_json'::text) ->> 'token_id', '') IN (SELECT COALESCE((ra6.args -> 'args_json'::text) ->> 'token_id', '') FROM action_receipt_actions ra6 WHERE ra6.receipt_id = r.receipt_id AND ra6.action_kind = 'FUNCTION_CALL' AND ra6.args ->> 'args_json'::text IS NOT NULL AND ra6.args ->> 'method_name'::text = 'withdraw')
    ) = 2
ORDER BY b.block_timestamp LIMIT $3
