
SELECT b.block_timestamp,
       r.predecessor_account_id from_account,
       b.block_height,
       convert_from(decode(ara.args ->> 'args_base64', 'base64'), 'UTF8') args_base64,
       r.originated_from_transaction_hash transaction_hash,
       ara.args ->'args_json'->>'amount' amount_transferred,
       'token' currency_transferred, /* TODO: Show the actual token symbol? */
       r.receiver_account_id receiver_owner_account
FROM receipts r
    INNER JOIN execution_outcomes eo ON eo.receipt_id = r.receipt_id
    INNER JOIN blocks b ON b.block_hash = r.included_in_block_hash
    INNER JOIN action_receipt_actions ara ON ara.receipt_id = r.receipt_id
WHERE 
  eo.status IN ('SUCCESS_RECEIPT_ID', 'SUCCESS_VALUE')
  AND ara.action_kind = 'FUNCTION_CALL'
  AND COALESCE(ara.args::json->>'method_name', '') = 'ft_transfer'
  AND (ara.args -> 'args_json'::text) ->> 'receiver_id'::text = $1
  AND b.block_timestamp > $2

ORDER BY block_timestamp
LIMIT $3
