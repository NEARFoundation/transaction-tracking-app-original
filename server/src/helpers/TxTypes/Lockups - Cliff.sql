SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       ra.args ->> 'deposit' amount_transferred,
       'NEAR' currency_transferred,
       args -> 'args_json' ->> 'owner_account_id' receiver_owner_account,
       (SELECT r7.receiver_account_id FROM receipts r7
           INNER JOIN action_receipt_actions ra7 ON ra7.receipt_id = r7.receipt_id
           WHERE r7.originated_from_transaction_hash = r.originated_from_transaction_hash
             AND r7.predecessor_account_id = r.receiver_account_id
             AND r7.receiver_account_id LIKE '%.lockup.near'
             AND ra7.action_kind = 'CREATE_ACCOUNT') receiver_lockup_account,
       args->'args_json' ->> 'lockup_timestamp' lockup_start,
       args->'args_json' ->> 'release_duration' release_duration,
       args->'args_json' -> 'vesting_schedule' -> 'VestingSchedule' ->> 'cliff_timestamp' cliff_timestamp
FROM receipts r
INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.predecessor_account_id = $1
AND r.receiver_account_id = 'lockup.near'
AND e.status = 'SUCCESS_RECEIPT_ID'
AND ra.action_kind = 'FUNCTION_CALL'
AND ra.args ->> 'args_json'::text IS NOT NULL
AND ra.args ->> 'method_name'::text = 'create'
AND (ra.args::json -> 'args_json' -> 'vesting_schedule' -> 'VestingSchedule' ->> 'cliff_timestamp')::bigint > 0
AND b.block_timestamp > $2
AND EXISTS(
    SELECT 1
    FROM receipts r2
    INNER JOIN execution_outcomes e2 ON e2.receipt_id = r2.receipt_id
    INNER JOIN action_receipt_actions ra2 ON ra2.receipt_id = r2.receipt_id
    WHERE r2.originated_from_transaction_hash = r.originated_from_transaction_hash
      AND r2.predecessor_account_id = r.receiver_account_id
      AND r2.receiver_account_id LIKE '%.lockup.near'
      AND e2.status = 'SUCCESS_VALUE'
      AND ra2.action_kind = 'CREATE_ACCOUNT'
      AND EXISTS (
        SELECT 1
        FROM action_receipt_actions ra3
        WHERE ra3.receipt_id = r2.receipt_id
          AND ra3.action_kind = 'DEPLOY_CONTRACT'
          AND ra3.receipt_receiver_account_id = r2.receiver_account_id
      )
      AND EXISTS (
        SELECT 1
        FROM action_receipt_actions ra4
        WHERE ra4.receipt_id = r2.receipt_id
          AND ra4.action_kind = 'TRANSFER'
          AND ra4.receipt_receiver_account_id = r2.receiver_account_id
      )
      AND EXISTS (
        SELECT 1
        FROM action_receipt_actions ra5
        WHERE ra5.receipt_id = r2.receipt_id
          AND ra5.action_kind = 'FUNCTION_CALL'
          AND ra5.args ->> 'args_json'::text IS NOT NULL
          AND ra5.args ->> 'method_name'::text = 'new'
          AND ra5.receipt_receiver_account_id = r2.receiver_account_id
      )
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
      AND ra6.action_kind = 'FUNCTION_CALL'
      AND ra6.args ->> 'args_json'::text IS NOT NULL
      AND ra6.args ->> 'method_name'::text = 'on_lockup_create'
)
ORDER BY b.block_timestamp LIMIT $3
