
SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ara.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       ara.args ->'args_json'->>'amount' amount_transferred,
       'token' currency_transferred,
       r.receiver_account_id receiver_owner_account
FROM receipts r
    INNER JOIN execution_outcomes eo ON eo.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN action_receipt_actions ara ON ara.receipt_id = r.receipt_id
WHERE 
  eo.status IN ('SUCCESS_RECEIPT_ID', 'SUCCESS_VALUE')
  AND ara.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ara.args::json->>'method_name', '') = 'ft_transfer'
  AND COALESCE((ara.args::json->'args_json')::json->>'receiver_id', '') = $1
  AND b.block_timestamp > $2
  AND r.predecessor_account_id IN ('nf-payments.near') /* TODO: List all the possible accounts that might send FT... or... figure out a way to speed up the query without this condition. */

ORDER BY block_timestamp
LIMIT $3
