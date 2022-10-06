/* https://stackoverflow.com/a/63349501/ 
https://stackoverflow.com/a/12816187/ 
https://dba.stackexchange.com/a/86726/
*/

/* =============================================================== */
CREATE TEMP TABLE transactionHashes AS
WITH t (transactionHash) AS (
 VALUES

('EvUvPUGaH4qiRZbvfGjxmxGCTzxC5sRXLK2ea6bCnmhc'),

('6MUJAkUB9acN1GVX92XvrNgtUseZnpNU8P9QWUv2Fqkx'),
('3L9WjpFmm11g9L5VW4JMZ4NSW3Czd5e2zmdQrkARW8jj'),
('3vqwtcf3R1xWZmNJikiuWZzQDEjhhptZxuNFMXP8D4di'),
('9RM9gQXbDXrn78wYXWaEcrnfkjZqazXdZbEpAdphvaaA'),

('HivQc1gQfvLmyiyAKwvL4AxvnSn9Y4dnWqKBhsBnpShh'),
('AVt7xkpnv3erFaP16TZsaGNzMT5rGgN41xmvvR6BEqau'),
('7ciBvqEAmGaYWcqBgAafRCf631M2Wy4jphjmt3ZBKT9H'),
('9Wh28jmkrvR8tZ21KjjJXkq3oAup1kMrwsRZqAoCyER4'),
('3x1CTJmK5ea31xCbwpqVY21Vv2m9TPBc6Hqzg72Qs47H'),
('8P8p9YrGomnJB6EwhJhGtaJc5zQNfmxMV6bogjo1pz1Y'),

('F1V3VRcuDsypkmHCdqMvFrLrGK24TG8UNswPNkMgQA4v'),
('3upmFK2CB7VaYQ4aMoMB2pC5nkxXv9y5vRdHWjmGraju'),
('FEwtUcz8uiUMC6CRxtX4HE9TDiBStEmKvXezWCcnW1sL'),
('CZmao3BjFyPwoZMxaHckF22QXm1jYVGCcJmNKiB85AGh')
)
SELECT * FROM t;
/* =============================================================== */
CREATE TABLE temp_test_export_transactions AS 
SELECT 
	TRANSACTION_HASH,
	INCLUDED_IN_BLOCK_HASH,
	INCLUDED_IN_CHUNK_HASH,
	INDEX_IN_CHUNK,
	BLOCK_TIMESTAMP,
	SIGNER_ACCOUNT_ID,
	SIGNER_PUBLIC_KEY,
	NONCE,
	RECEIVER_ACCOUNT_ID,
	SIGNATURE,
	STATUS,
	CONVERTED_INTO_RECEIPT_ID,
	RECEIPT_CONVERSION_GAS_BURNT,
	RECEIPT_CONVERSION_TOKENS_BURNT 
FROM TRANSACTIONS T
WHERE 
TRANSACTION_HASH IN (SELECT transactionHash FROM transactionHashes);
/* =============================================================== */
CREATE TABLE temp_test_export_receipts AS 
SELECT 
	R.RECEIPT_ID,
	R.INCLUDED_IN_BLOCK_HASH,
	R.INCLUDED_IN_CHUNK_HASH,
	R.INDEX_IN_CHUNK,
	R.INCLUDED_IN_BLOCK_TIMESTAMP,
	R.PREDECESSOR_ACCOUNT_ID,
	R.RECEIVER_ACCOUNT_ID,
	R.RECEIPT_KIND,
	R.ORIGINATED_FROM_TRANSACTION_HASH
FROM TRANSACTIONS T
LEFT JOIN RECEIPTS R ON T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
WHERE 
T.TRANSACTION_HASH IN (SELECT transactionHash FROM transactionHashes);
/* =============================================================== */
CREATE TABLE temp_test_export_execution_outcomes AS 
SELECT 
	EO.RECEIPT_ID,
	EO.EXECUTED_IN_BLOCK_HASH,
	EO.EXECUTED_IN_BLOCK_TIMESTAMP,
	EO.INDEX_IN_CHUNK,
	EO.GAS_BURNT,
	EO.TOKENS_BURNT,
	EO.EXECUTOR_ACCOUNT_ID,
	EO.STATUS,
	EO.SHARD_ID
FROM TRANSACTIONS T
LEFT JOIN RECEIPTS R ON T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
LEFT JOIN EXECUTION_OUTCOMES EO ON EO.RECEIPT_ID = R.RECEIPT_ID
WHERE 
T.TRANSACTION_HASH IN (SELECT transactionHash FROM transactionHashes);
/* =============================================================== */
CREATE TABLE temp_test_export_blocks AS 
SELECT 
	B.BLOCK_HEIGHT,
	B.BLOCK_HASH,
	B.PREV_BLOCK_HASH,
	B.BLOCK_TIMESTAMP,
	B.TOTAL_SUPPLY,
	B.GAS_PRICE,
	B.AUTHOR_ACCOUNT_ID
FROM TRANSACTIONS T
LEFT JOIN RECEIPTS R ON T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
LEFT JOIN BLOCKS B ON B.BLOCK_HASH = R.INCLUDED_IN_BLOCK_HASH
WHERE 
T.TRANSACTION_HASH IN (SELECT transactionHash FROM transactionHashes);
/* =============================================================== */
CREATE TABLE temp_test_export_action_receipt_actions AS 
SELECT 
	ARA.RECEIPT_ID,
	ARA.INDEX_IN_ACTION_RECEIPT,
	ARA.ACTION_KIND,
	ARA.ARGS,
	ARA.RECEIPT_PREDECESSOR_ACCOUNT_ID,
	ARA.RECEIPT_RECEIVER_ACCOUNT_ID,
	ARA.RECEIPT_INCLUDED_IN_BLOCK_TIMESTAMP
FROM TRANSACTIONS T
LEFT JOIN RECEIPTS R ON T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
LEFT JOIN ACTION_RECEIPT_ACTIONS ARA ON ARA.RECEIPT_ID = R.RECEIPT_ID
WHERE 
T.TRANSACTION_HASH IN (SELECT transactionHash FROM transactionHashes);
/* =============================================================== */
CREATE TABLE temp_test_export_transaction_actions AS 
SELECT 
	ta.transaction_hash, 
	ta.index_in_transaction, 
	ta."action_kind", 
	ta.args
FROM TRANSACTION_ACTIONS ta
WHERE 
ta.TRANSACTION_HASH IN (SELECT transactionHash FROM transactionHashes);