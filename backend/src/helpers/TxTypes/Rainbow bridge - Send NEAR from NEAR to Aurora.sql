SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       ra.args ->'args_json' ->> 'amount' amount_transferred,
       'NEAR' currency_transferred,
       r.receiver_account_id receiver_owner_account
FROM receipts r
INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.receiver_account_id = 'wrap.near'
AND r.predecessor_account_id = $1
AND e.status = 'SUCCESS_RECEIPT_ID'
AND ra.action_kind = 'FUNCTION_CALL'
AND ra.args ->> 'args_json'::text IS NOT NULL
AND ra.args ->> 'method_name'::text = 'ft_transfer_call'
AND (ra.args -> 'args_json'::text) ->> 'receiver_id'::text = 'aurora'
AND b.block_timestamp > $2
AND EXISTS(
    SELECT 1
    FROM receipts r3
    INNER JOIN execution_outcomes e3 ON e3.receipt_id = r3.receipt_id
    INNER JOIN action_receipt_actions ra3 ON ra3.receipt_id = r3.receipt_id
    WHERE r3.originated_from_transaction_hash = r.originated_from_transaction_hash
      AND e3.status = 'SUCCESS_VALUE'
      AND r3.predecessor_account_id = r.receiver_account_id
      AND r3.receiver_account_id = (ra.args -> 'args_json'::text) ->> 'receiver_id'::text
      AND ra3.action_kind = 'FUNCTION_CALL'
      AND ra3.args ->> 'args_json'::text IS NOT NULL
      AND ra3.args ->> 'method_name'::text = 'ft_on_transfer'
)
AND EXISTS(
    SELECT 1
    FROM receipts r4
    INNER JOIN execution_outcomes e4 ON e4.receipt_id = r4.receipt_id
    INNER JOIN action_receipt_actions ra4 ON ra4.receipt_id = r4.receipt_id
    WHERE r4.originated_from_transaction_hash = r.originated_from_transaction_hash
      AND e4.status = 'SUCCESS_VALUE'
      AND r4.predecessor_account_id = r.receiver_account_id
      AND r4.receiver_account_id = r.receiver_account_id
      AND ra4.action_kind = 'FUNCTION_CALL'
      AND ra4.args ->> 'args_json'::text IS NOT NULL
      AND ra4.args ->> 'method_name'::text = 'ft_resolve_transfer'
)
ORDER BY b.block_timestamp LIMIT $3
