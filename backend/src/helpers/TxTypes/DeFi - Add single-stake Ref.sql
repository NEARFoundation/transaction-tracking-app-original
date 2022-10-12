SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       r.originated_from_transaction_hash transaction_hash,
       ra.args ->>'deposit' amount_transferred,
       convert_from(decode(ra.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       'NEAR' currency_transferred,
       r.receiver_account_id receiver_owner_account
FROM receipts r
    INNER JOIN execution_outcomes e ON e.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN action_receipt_actions ra ON ra.receipt_id = r.receipt_id
WHERE r.predecessor_account_id = $1
  AND r.receiver_account_id = 'xtoken.ref-finance.near'
  AND e.status = 'SUCCESS_VALUE'
  AND ra.action_kind = 'FUNCTION_CALL'
  AND ra.args ->> 'args_json'::text IS NOT NULL
  AND ra.args ->> 'method_name'::text = 'storage_deposit'
  AND (ra.args -> 'args_json'::text) ->> 'account_id'::text = r.predecessor_account_id
  AND b.block_timestamp > $2
ORDER BY b.block_timestamp LIMIT $3
