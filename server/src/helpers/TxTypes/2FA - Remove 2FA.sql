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
  AND e.status = 'SUCCESS_RECEIPT_ID'
  AND ra.action_kind = 'FUNCTION_CALL'
  AND ra.args ->> 'args_json'::text IS NOT NULL
  AND ra.args ->> 'method_name'::text = 'confirm'
  AND (ra.args -> 'args_json'::text) ->> 'request_id'::text ~ '^[0-9]+$'
  AND (SELECT count(*) FROM jsonb_object_keys(COALESCE(ra.args -> 'args_json'::text, '{}')::jsonb)) = 1
  AND EXISTS(
    SELECT 1
    FROM receipts r2
    INNER JOIN execution_outcomes e2 ON e2.receipt_id = r2.receipt_id
    INNER JOIN action_receipt_actions ra2 ON ra2.receipt_id = r2.receipt_id
    WHERE r2.originated_from_transaction_hash = r.originated_from_transaction_hash
  AND e2.status = 'SUCCESS_VALUE'
  AND ra2.receipt_predecessor_account_id = r.predecessor_account_id
  AND ra2.receipt_receiver_account_id = r.receiver_account_id
  AND ra2.action_kind = 'ADD_KEY'
  AND ((ra2.args -> 'access_key'::text) -> 'permission'::text) ->> 'permission_kind'::text = 'FULL_ACCESS'
    )
  AND EXISTS(
    SELECT 1
    FROM receipts r3
    INNER JOIN execution_outcomes e3 ON e3.receipt_id = r3.receipt_id
    INNER JOIN action_receipt_actions ra3 ON ra3.receipt_id = r3.receipt_id
    WHERE r3.originated_from_transaction_hash = r.originated_from_transaction_hash
  AND e3.status = 'SUCCESS_VALUE'
  AND ra3.receipt_predecessor_account_id = r.predecessor_account_id
  AND ra3.receipt_receiver_account_id = r.receiver_account_id
  AND ra3.action_kind = 'DELETE_KEY'
    )
  AND EXISTS(
    SELECT 1
    FROM receipts r4
    INNER JOIN execution_outcomes e4 ON e4.receipt_id = r4.receipt_id
    INNER JOIN action_receipt_actions ra4 ON ra4.receipt_id = r4.receipt_id
    WHERE r4.originated_from_transaction_hash = r.originated_from_transaction_hash
  AND e4.status = 'SUCCESS_VALUE'
  AND ra4.receipt_predecessor_account_id = r.predecessor_account_id
  AND ra4.receipt_receiver_account_id = r.receiver_account_id
  AND ra4.action_kind = 'DEPLOY_CONTRACT'
    )
  AND b.block_timestamp > $2
ORDER BY b.block_timestamp LIMIT $3
