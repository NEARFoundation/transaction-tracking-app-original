SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       (SELECT ra2.args  FROM receipts r2
          INNER JOIN action_receipt_actions ra2 ON ra2.receipt_id = r2.receipt_id
          where ra2.action_kind='TRANSFER' AND r2.originated_from_transaction_hash = r.originated_from_transaction_hash
            AND ra2.receipt_predecessor_account_id <> 'system')->>'deposit' amount_transferred,
       'NEAR' currency_transferred,
       r.receiver_account_id receiver_owner_account
FROM receipts r
INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.predecessor_account_id = $1
AND (r.receiver_account_id LIKE '%.poolv1.near' OR r.receiver_account_id LIKE '%.pool.near')
AND e.status = 'SUCCESS_VALUE'
AND ra.action_kind = 'FUNCTION_CALL'
AND ra.args ->> 'args_json'::text IS NOT NULL
AND ra.args ->> 'method_name'::text IN ('withdraw', 'withdraw_all')
AND b.block_timestamp > $2
AND EXISTS(
    SELECT 1
    FROM receipts r2
    INNER JOIN execution_outcomes e2 ON e2.receipt_id = r2.receipt_id
    INNER JOIN action_receipt_actions ra2 ON ra2.receipt_id = r2.receipt_id
    WHERE r2.originated_from_transaction_hash = r.originated_from_transaction_hash
      AND r2.predecessor_account_id = r.receiver_account_id
      AND r2.receiver_account_id LIKE r.predecessor_account_id
      AND e2.status = 'SUCCESS_VALUE'
      AND ra2.action_kind = 'TRANSFER'
)
ORDER BY b.block_timestamp LIMIT $3
