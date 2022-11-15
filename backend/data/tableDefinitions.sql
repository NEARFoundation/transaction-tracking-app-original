/* 
This file defines the "CREATE TABLE" SQL queries based on the 6 tables of the indexer database that this app needs to read from, and those table 
definitions include WHERE clauses to filter down the rows to include only the ones relevant to `backend/test_helpers/expectedOutput.csv` (used in tests).
Why create new tables (which requires write access)? Because Ryan Walsh thinks there might not be a better way to download only matching rows. pg_dump 
doesn't support WHERE clauses and also doesn't support views.

https://stackoverflow.com/a/63349501/ 
https://stackoverflow.com/a/12816187/ 
https://dba.stackexchange.com/a/86726/
 */
/* =============================================================== */
DROP TABLE IF EXISTS temp_test_export_transactions;

CREATE TABLE temp_test_export_transactions AS
SELECT
    T.TRANSACTION_HASH,
    T.INCLUDED_IN_BLOCK_HASH,
    T.INCLUDED_IN_CHUNK_HASH,
    T.INDEX_IN_CHUNK,
    T.BLOCK_TIMESTAMP,
    T.SIGNER_ACCOUNT_ID,
    T.SIGNER_PUBLIC_KEY,
    T.NONCE,
    T.RECEIVER_ACCOUNT_ID,
    T.SIGNATURE,
    T.STATUS,
    T.CONVERTED_INTO_RECEIPT_ID,
    T.RECEIPT_CONVERSION_GAS_BURNT,
    T.RECEIPT_CONVERSION_TOKENS_BURNT
FROM
    TRANSACTIONS T
    LEFT JOIN RECEIPTS R ON T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
WHERE
    T.TRANSACTION_HASH IN (
        SELECT
            transactionHash
        FROM
            transactionHashes);


/* =============================================================== */
DROP TABLE IF EXISTS temp_test_export_receipts;

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
FROM
    TRANSACTIONS T
    LEFT JOIN RECEIPTS R ON (T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
            OR t.TRANSACTION_HASH = R.ORIGINATED_FROM_TRANSACTION_HASH)
WHERE
    T.TRANSACTION_HASH IN (
        SELECT
            transactionHash
        FROM
            transactionHashes);


/* =============================================================== */
DROP TABLE IF EXISTS temp_test_export_execution_outcomes;

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
FROM
    TRANSACTIONS T
    LEFT JOIN RECEIPTS R ON (T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
            OR t.TRANSACTION_HASH = R.ORIGINATED_FROM_TRANSACTION_HASH)
    LEFT JOIN EXECUTION_OUTCOMES EO ON EO.RECEIPT_ID = R.RECEIPT_ID
WHERE
    T.TRANSACTION_HASH IN (
        SELECT
            transactionHash
        FROM
            transactionHashes);


/* =============================================================== */
DROP TABLE IF EXISTS temp_test_export_blocks;

CREATE TABLE temp_test_export_blocks AS
SELECT
    B.BLOCK_HEIGHT,
    B.BLOCK_HASH,
    B.PREV_BLOCK_HASH,
    B.BLOCK_TIMESTAMP,
    B.TOTAL_SUPPLY,
    B.GAS_PRICE,
    B.AUTHOR_ACCOUNT_ID
FROM
    TRANSACTIONS T
    LEFT JOIN RECEIPTS R ON T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
    LEFT JOIN BLOCKS B ON B.BLOCK_HASH = R.INCLUDED_IN_BLOCK_HASH
WHERE
    T.TRANSACTION_HASH IN (
        SELECT
            transactionHash
        FROM
            transactionHashes);


/* =============================================================== */
DROP TABLE IF EXISTS temp_test_export_action_receipt_actions;

CREATE TABLE temp_test_export_action_receipt_actions AS
SELECT
    ARA.RECEIPT_ID,
    ARA.INDEX_IN_ACTION_RECEIPT,
    ARA.ACTION_KIND,
    ARA.ARGS,
    ARA.RECEIPT_PREDECESSOR_ACCOUNT_ID,
    ARA.RECEIPT_RECEIVER_ACCOUNT_ID,
    ARA.RECEIPT_INCLUDED_IN_BLOCK_TIMESTAMP
FROM
    TRANSACTIONS T
    LEFT JOIN RECEIPTS R ON (T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
            OR t.TRANSACTION_HASH = R.ORIGINATED_FROM_TRANSACTION_HASH)
    LEFT JOIN ACTION_RECEIPT_ACTIONS ARA ON ARA.RECEIPT_ID = R.RECEIPT_ID
WHERE
    T.TRANSACTION_HASH IN (
        SELECT
            transactionHash
        FROM
            transactionHashes);


/* =============================================================== */
DROP TABLE IF EXISTS temp_test_export_transaction_actions;

CREATE TABLE temp_test_export_transaction_actions AS
SELECT
    ta.transaction_hash,
    ta.index_in_transaction,
    ta."action_kind",
    ta.args
FROM
    TRANSACTIONS T
    LEFT JOIN TRANSACTION_ACTIONS ta ON T.TRANSACTION_HASH = TA.TRANSACTION_HASH
    LEFT JOIN RECEIPTS R ON T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
WHERE
    T.TRANSACTION_HASH IN (
        SELECT
            transactionHash
        FROM
            transactionHashes);

