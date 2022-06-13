SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       (SELECT ra7.args ->> 'deposit'::text FROM receipts r7
           INNER JOIN action_receipt_actions ra7 ON ra7.receipt_id = r7.receipt_id
           WHERE r7.originated_from_transaction_hash = r.originated_from_transaction_hash
             AND r7.predecessor_account_id = r.receiver_account_id
             AND r7.receiver_account_id = (ra.args -> 'args_json'::text) ->> 'new_account_id'::text
             AND ra7.action_kind = 'TRANSFER') amount_transferred,
       'NEAR' currency_transferred,
       (ra.args -> 'args_json'::text) ->> 'new_account_id'::text receiver_owner_account
FROM receipts r
INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.receiver_account_id = 'near'
AND r.predecessor_account_id = 'near'
AND e.status = 'SUCCESS_RECEIPT_ID'
AND ra.action_kind = 'FUNCTION_CALL'
AND ra.args ->> 'args_json'::text IS NOT NULL
AND ra.args ->> 'method_name'::text = 'create_account_and_claim'
AND (ra.args -> 'args_json'::text) ->> 'new_account_id'::text = $1
AND b.block_timestamp > $2
AND EXISTS(
    SELECT 1
    FROM receipts r2
    INNER JOIN execution_outcomes e2 ON e2.receipt_id = r2.receipt_id
    INNER JOIN action_receipt_actions ra2 ON ra2.receipt_id = r2.receipt_id
    WHERE r2.originated_from_transaction_hash = r.originated_from_transaction_hash
      AND r2.predecessor_account_id = r.receiver_account_id
      AND r2.receiver_account_id = (ra.args -> 'args_json'::text) ->> 'new_account_id'::text
      AND e2.status = 'SUCCESS_VALUE'
      AND ra2.action_kind = 'CREATE_ACCOUNT'
      AND EXISTS (
        SELECT 1
        FROM action_receipt_actions ra3
        WHERE ra3.receipt_id = r2.receipt_id
          AND ra3.action_kind = 'ADD_KEY'
          AND ra3.receipt_receiver_account_id = r2.receiver_account_id
      )
      AND EXISTS (
        SELECT 1
        FROM action_receipt_actions ra4
        WHERE ra4.receipt_id = r2.receipt_id
          AND ra4.action_kind = 'TRANSFER'
          AND ra4.receipt_receiver_account_id = r2.receiver_account_id
      )
)
AND EXISTS(
    SELECT 1
    FROM receipts r5
    INNER JOIN execution_outcomes e5 ON e5.receipt_id = r5.receipt_id
    INNER JOIN action_receipt_actions ra5 ON ra5.receipt_id = r5.receipt_id
    WHERE r5.originated_from_transaction_hash = r.originated_from_transaction_hash
      AND e5.status = 'SUCCESS_VALUE'
      AND r5.predecessor_account_id = r.receiver_account_id
      AND r5.receiver_account_id = r.receiver_account_id
      AND ra5.action_kind = 'FUNCTION_CALL'
      AND ra5.args ->> 'args_json'::text IS NOT NULL
      AND ra5.args ->> 'method_name'::text = 'on_account_created_and_claimed'
)
AND EXISTS(
    SELECT 1
    FROM receipts r6
    INNER JOIN execution_outcomes e6 ON e6.receipt_id = r6.receipt_id
    INNER JOIN action_receipt_actions ra6 ON ra6.receipt_id = r6.receipt_id
    WHERE r6.originated_from_transaction_hash = r.originated_from_transaction_hash
      AND e6.status = 'SUCCESS_VALUE'
      AND r6.predecessor_account_id = r.receiver_account_id
      AND r6.receiver_account_id = r.receiver_account_id
      AND ra6.action_kind = 'DELETE_KEY'
)
UNION
SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       (SELECT ra4.args ->> 'deposit'::text FROM receipts r4
           INNER JOIN action_receipt_actions ra4 ON ra4.receipt_id = r4.receipt_id
           WHERE r4.originated_from_transaction_hash = r.originated_from_transaction_hash
             AND r4.predecessor_account_id = r.receiver_account_id
             AND r4.receiver_account_id = (ra.args -> 'args_json'::text) ->> 'account_id'::text
             AND ra4.action_kind = 'TRANSFER') amount_transferred,
       'NEAR' currency_transferred,
       (ra.args -> 'args_json'::text) ->> 'account_id'::text receiver_owner_account
FROM receipts r
INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.receiver_account_id = 'near'
AND r.predecessor_account_id = 'near'
AND e.status = 'SUCCESS_RECEIPT_ID'
AND ra.action_kind = 'FUNCTION_CALL'
AND ra.args ->> 'args_json'::text IS NOT NULL
AND ra.args ->> 'method_name'::text = 'claim'
AND (ra.args -> 'args_json'::text) ->> 'account_id'::text = $1
AND b.block_timestamp > $2
AND EXISTS(
    SELECT 1
    FROM receipts r2
    INNER JOIN execution_outcomes e2 ON e2.receipt_id = r2.receipt_id
    INNER JOIN action_receipt_actions ra2 ON ra2.receipt_id = r2.receipt_id
    WHERE r2.originated_from_transaction_hash = r.originated_from_transaction_hash
      AND r2.predecessor_account_id = r.receiver_account_id
      AND r2.receiver_account_id = (ra.args -> 'args_json'::text) ->> 'account_id'::text
      AND e2.status = 'SUCCESS_VALUE'
      AND ra2.action_kind = 'TRANSFER'
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
      AND ra3.action_kind = 'DELETE_KEY'
)
ORDER BY b.block_timestamp LIMIT $3
