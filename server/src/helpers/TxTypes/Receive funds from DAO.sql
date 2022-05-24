SELECT block_timestamp,
       originated_from_transaction_hash transaction_hash,
       block_height,
       args ->> 'deposit' deposit,
    args ->> 'args_base64' args_base64
FROM receipts r
    INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.receiver_account_id LIKE '%.sputnik-dao.near'
  AND e.status = 'SUCCESS_RECEIPT_ID'
  AND EXISTS(
    SELECT 1
    FROM receipts r2
    INNER JOIN execution_outcomes e2 ON e2.receipt_id = r2.receipt_id
    INNER JOIN action_receipt_actions ra2 ON ra2.receipt_id = r2.receipt_id
    WHERE r2.originated_from_transaction_hash = r.originated_from_transaction_hash
  AND e2.status = 'SUCCESS_VALUE'
  AND ra2.action_kind = 'TRANSFER'
  AND r2.receiver_account_id = $1
  AND r2.predecessor_account_id = r.receiver_account_id
    )
  AND ra.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ra.args::json->>'method_name', '') = 'act_proposal'
  AND COALESCE((ra.args::json->'args_json')::json->>'action', '') = 'VoteApprove'
  AND b.block_timestamp > $2
ORDER BY b.block_timestamp LIMIT $3
