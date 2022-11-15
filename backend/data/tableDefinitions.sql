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
WHERE (t.block_timestamp >= 1632824080000000000
    AND t.block_timestamp <= 1632825580000000000)
    OR (t.block_timestamp >= 1646392507000000000
        AND t.block_timestamp <= 1646394007000000000)
    OR (t.block_timestamp >= 1646393141000000000
        AND t.block_timestamp <= 1646394641000000000)
    OR (t.block_timestamp >= 1646393197000000000
        AND t.block_timestamp <= 1646394697000000000)
    OR (t.block_timestamp >= 1646393287000000000
        AND t.block_timestamp <= 1646394787000000000)
    OR (t.block_timestamp >= 1646393379000000000
        AND t.block_timestamp <= 1646394879000000000)
    OR (t.block_timestamp >= 1646393447000000000
        AND t.block_timestamp <= 1646394947000000000)
    OR (t.block_timestamp >= 1646393719000000000
        AND t.block_timestamp <= 1646395219000000000)
    OR (t.block_timestamp >= 1646394047000000000
        AND t.block_timestamp <= 1646395547000000000)
    OR (t.block_timestamp >= 1646394131000000000
        AND t.block_timestamp <= 1646395631000000000)
    OR (t.block_timestamp >= 1646394338000000000
        AND t.block_timestamp <= 1646395838000000000)
    OR (t.block_timestamp >= 1646394497000000000
        AND t.block_timestamp <= 1646395997000000000)
    OR (t.block_timestamp >= 1646394563000000000
        AND t.block_timestamp <= 1646396063000000000)
    OR (t.block_timestamp >= 1646394733000000000
        AND t.block_timestamp <= 1646396233000000000)
    OR (t.block_timestamp >= 1646727222000000000
        AND t.block_timestamp <= 1646728722000000000)
    OR (t.block_timestamp >= 1646727372000000000
        AND t.block_timestamp <= 1646728872000000000)
    OR (t.block_timestamp >= 1646727498000000000
        AND t.block_timestamp <= 1646728998000000000)
    OR (t.block_timestamp >= 1646727574000000000
        AND t.block_timestamp <= 1646729074000000000)
    OR (t.block_timestamp >= 1646728188000000000
        AND t.block_timestamp <= 1646729688000000000)
    OR (t.block_timestamp >= 1646728239000000000
        AND t.block_timestamp <= 1646729739000000000)
    OR (t.block_timestamp >= 1646728293000000000
        AND t.block_timestamp <= 1646729793000000000)
    OR (t.block_timestamp >= 1646728351000000000
        AND t.block_timestamp <= 1646729851000000000)
    OR (t.block_timestamp >= 1646728446000000000
        AND t.block_timestamp <= 1646729946000000000)
    OR (t.block_timestamp >= 1646728498000000000
        AND t.block_timestamp <= 1646729998000000000)
    OR (t.block_timestamp >= 1646728530000000000
        AND t.block_timestamp <= 1646730030000000000)
    OR (t.block_timestamp >= 1646728710000000000
        AND t.block_timestamp <= 1646730210000000000)
    OR (t.block_timestamp >= 1646728973000000000
        AND t.block_timestamp <= 1646730473000000000)
    OR (t.block_timestamp >= 1646729110000000000
        AND t.block_timestamp <= 1646730610000000000)
    OR (t.block_timestamp >= 1646729307000000000
        AND t.block_timestamp <= 1646730807000000000)
    OR (t.block_timestamp >= 1646733868000000000
        AND t.block_timestamp <= 1646735368000000000)
    OR (t.block_timestamp >= 1646734039000000000
        AND t.block_timestamp <= 1646735539000000000)
    OR (t.block_timestamp >= 1651504866000000000
        AND t.block_timestamp <= 1651506366000000000)
    OR (t.block_timestamp >= 1659424977000000000
        AND t.block_timestamp <= 1659426477000000000);


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
    LEFT JOIN RECEIPTS R ON T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
WHERE (t.block_timestamp >= 1632824080000000000
    AND t.block_timestamp <= 1632825580000000000)
    OR (t.block_timestamp >= 1646392507000000000
        AND t.block_timestamp <= 1646394007000000000)
    OR (t.block_timestamp >= 1646393141000000000
        AND t.block_timestamp <= 1646394641000000000)
    OR (t.block_timestamp >= 1646393197000000000
        AND t.block_timestamp <= 1646394697000000000)
    OR (t.block_timestamp >= 1646393287000000000
        AND t.block_timestamp <= 1646394787000000000)
    OR (t.block_timestamp >= 1646393379000000000
        AND t.block_timestamp <= 1646394879000000000)
    OR (t.block_timestamp >= 1646393447000000000
        AND t.block_timestamp <= 1646394947000000000)
    OR (t.block_timestamp >= 1646393719000000000
        AND t.block_timestamp <= 1646395219000000000)
    OR (t.block_timestamp >= 1646394047000000000
        AND t.block_timestamp <= 1646395547000000000)
    OR (t.block_timestamp >= 1646394131000000000
        AND t.block_timestamp <= 1646395631000000000)
    OR (t.block_timestamp >= 1646394338000000000
        AND t.block_timestamp <= 1646395838000000000)
    OR (t.block_timestamp >= 1646394497000000000
        AND t.block_timestamp <= 1646395997000000000)
    OR (t.block_timestamp >= 1646394563000000000
        AND t.block_timestamp <= 1646396063000000000)
    OR (t.block_timestamp >= 1646394733000000000
        AND t.block_timestamp <= 1646396233000000000)
    OR (t.block_timestamp >= 1646727222000000000
        AND t.block_timestamp <= 1646728722000000000)
    OR (t.block_timestamp >= 1646727372000000000
        AND t.block_timestamp <= 1646728872000000000)
    OR (t.block_timestamp >= 1646727498000000000
        AND t.block_timestamp <= 1646728998000000000)
    OR (t.block_timestamp >= 1646727574000000000
        AND t.block_timestamp <= 1646729074000000000)
    OR (t.block_timestamp >= 1646728188000000000
        AND t.block_timestamp <= 1646729688000000000)
    OR (t.block_timestamp >= 1646728239000000000
        AND t.block_timestamp <= 1646729739000000000)
    OR (t.block_timestamp >= 1646728293000000000
        AND t.block_timestamp <= 1646729793000000000)
    OR (t.block_timestamp >= 1646728351000000000
        AND t.block_timestamp <= 1646729851000000000)
    OR (t.block_timestamp >= 1646728446000000000
        AND t.block_timestamp <= 1646729946000000000)
    OR (t.block_timestamp >= 1646728498000000000
        AND t.block_timestamp <= 1646729998000000000)
    OR (t.block_timestamp >= 1646728530000000000
        AND t.block_timestamp <= 1646730030000000000)
    OR (t.block_timestamp >= 1646728710000000000
        AND t.block_timestamp <= 1646730210000000000)
    OR (t.block_timestamp >= 1646728973000000000
        AND t.block_timestamp <= 1646730473000000000)
    OR (t.block_timestamp >= 1646729110000000000
        AND t.block_timestamp <= 1646730610000000000)
    OR (t.block_timestamp >= 1646729307000000000
        AND t.block_timestamp <= 1646730807000000000)
    OR (t.block_timestamp >= 1646733868000000000
        AND t.block_timestamp <= 1646735368000000000)
    OR (t.block_timestamp >= 1646734039000000000
        AND t.block_timestamp <= 1646735539000000000)
    OR (t.block_timestamp >= 1651504866000000000
        AND t.block_timestamp <= 1651506366000000000)
    OR (t.block_timestamp >= 1659424977000000000
        AND t.block_timestamp <= 1659426477000000000);


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
    LEFT JOIN RECEIPTS R ON T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
    LEFT JOIN EXECUTION_OUTCOMES EO ON EO.RECEIPT_ID = R.RECEIPT_ID
WHERE (t.block_timestamp >= 1632824080000000000
    AND t.block_timestamp <= 1632825580000000000)
    OR (t.block_timestamp >= 1646392507000000000
        AND t.block_timestamp <= 1646394007000000000)
    OR (t.block_timestamp >= 1646393141000000000
        AND t.block_timestamp <= 1646394641000000000)
    OR (t.block_timestamp >= 1646393197000000000
        AND t.block_timestamp <= 1646394697000000000)
    OR (t.block_timestamp >= 1646393287000000000
        AND t.block_timestamp <= 1646394787000000000)
    OR (t.block_timestamp >= 1646393379000000000
        AND t.block_timestamp <= 1646394879000000000)
    OR (t.block_timestamp >= 1646393447000000000
        AND t.block_timestamp <= 1646394947000000000)
    OR (t.block_timestamp >= 1646393719000000000
        AND t.block_timestamp <= 1646395219000000000)
    OR (t.block_timestamp >= 1646394047000000000
        AND t.block_timestamp <= 1646395547000000000)
    OR (t.block_timestamp >= 1646394131000000000
        AND t.block_timestamp <= 1646395631000000000)
    OR (t.block_timestamp >= 1646394338000000000
        AND t.block_timestamp <= 1646395838000000000)
    OR (t.block_timestamp >= 1646394497000000000
        AND t.block_timestamp <= 1646395997000000000)
    OR (t.block_timestamp >= 1646394563000000000
        AND t.block_timestamp <= 1646396063000000000)
    OR (t.block_timestamp >= 1646394733000000000
        AND t.block_timestamp <= 1646396233000000000)
    OR (t.block_timestamp >= 1646727222000000000
        AND t.block_timestamp <= 1646728722000000000)
    OR (t.block_timestamp >= 1646727372000000000
        AND t.block_timestamp <= 1646728872000000000)
    OR (t.block_timestamp >= 1646727498000000000
        AND t.block_timestamp <= 1646728998000000000)
    OR (t.block_timestamp >= 1646727574000000000
        AND t.block_timestamp <= 1646729074000000000)
    OR (t.block_timestamp >= 1646728188000000000
        AND t.block_timestamp <= 1646729688000000000)
    OR (t.block_timestamp >= 1646728239000000000
        AND t.block_timestamp <= 1646729739000000000)
    OR (t.block_timestamp >= 1646728293000000000
        AND t.block_timestamp <= 1646729793000000000)
    OR (t.block_timestamp >= 1646728351000000000
        AND t.block_timestamp <= 1646729851000000000)
    OR (t.block_timestamp >= 1646728446000000000
        AND t.block_timestamp <= 1646729946000000000)
    OR (t.block_timestamp >= 1646728498000000000
        AND t.block_timestamp <= 1646729998000000000)
    OR (t.block_timestamp >= 1646728530000000000
        AND t.block_timestamp <= 1646730030000000000)
    OR (t.block_timestamp >= 1646728710000000000
        AND t.block_timestamp <= 1646730210000000000)
    OR (t.block_timestamp >= 1646728973000000000
        AND t.block_timestamp <= 1646730473000000000)
    OR (t.block_timestamp >= 1646729110000000000
        AND t.block_timestamp <= 1646730610000000000)
    OR (t.block_timestamp >= 1646729307000000000
        AND t.block_timestamp <= 1646730807000000000)
    OR (t.block_timestamp >= 1646733868000000000
        AND t.block_timestamp <= 1646735368000000000)
    OR (t.block_timestamp >= 1646734039000000000
        AND t.block_timestamp <= 1646735539000000000)
    OR (t.block_timestamp >= 1651504866000000000
        AND t.block_timestamp <= 1651506366000000000)
    OR (t.block_timestamp >= 1659424977000000000
        AND t.block_timestamp <= 1659426477000000000);


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
WHERE (t.block_timestamp >= 1632824080000000000
    AND t.block_timestamp <= 1632825580000000000)
    OR (t.block_timestamp >= 1646392507000000000
        AND t.block_timestamp <= 1646394007000000000)
    OR (t.block_timestamp >= 1646393141000000000
        AND t.block_timestamp <= 1646394641000000000)
    OR (t.block_timestamp >= 1646393197000000000
        AND t.block_timestamp <= 1646394697000000000)
    OR (t.block_timestamp >= 1646393287000000000
        AND t.block_timestamp <= 1646394787000000000)
    OR (t.block_timestamp >= 1646393379000000000
        AND t.block_timestamp <= 1646394879000000000)
    OR (t.block_timestamp >= 1646393447000000000
        AND t.block_timestamp <= 1646394947000000000)
    OR (t.block_timestamp >= 1646393719000000000
        AND t.block_timestamp <= 1646395219000000000)
    OR (t.block_timestamp >= 1646394047000000000
        AND t.block_timestamp <= 1646395547000000000)
    OR (t.block_timestamp >= 1646394131000000000
        AND t.block_timestamp <= 1646395631000000000)
    OR (t.block_timestamp >= 1646394338000000000
        AND t.block_timestamp <= 1646395838000000000)
    OR (t.block_timestamp >= 1646394497000000000
        AND t.block_timestamp <= 1646395997000000000)
    OR (t.block_timestamp >= 1646394563000000000
        AND t.block_timestamp <= 1646396063000000000)
    OR (t.block_timestamp >= 1646394733000000000
        AND t.block_timestamp <= 1646396233000000000)
    OR (t.block_timestamp >= 1646727222000000000
        AND t.block_timestamp <= 1646728722000000000)
    OR (t.block_timestamp >= 1646727372000000000
        AND t.block_timestamp <= 1646728872000000000)
    OR (t.block_timestamp >= 1646727498000000000
        AND t.block_timestamp <= 1646728998000000000)
    OR (t.block_timestamp >= 1646727574000000000
        AND t.block_timestamp <= 1646729074000000000)
    OR (t.block_timestamp >= 1646728188000000000
        AND t.block_timestamp <= 1646729688000000000)
    OR (t.block_timestamp >= 1646728239000000000
        AND t.block_timestamp <= 1646729739000000000)
    OR (t.block_timestamp >= 1646728293000000000
        AND t.block_timestamp <= 1646729793000000000)
    OR (t.block_timestamp >= 1646728351000000000
        AND t.block_timestamp <= 1646729851000000000)
    OR (t.block_timestamp >= 1646728446000000000
        AND t.block_timestamp <= 1646729946000000000)
    OR (t.block_timestamp >= 1646728498000000000
        AND t.block_timestamp <= 1646729998000000000)
    OR (t.block_timestamp >= 1646728530000000000
        AND t.block_timestamp <= 1646730030000000000)
    OR (t.block_timestamp >= 1646728710000000000
        AND t.block_timestamp <= 1646730210000000000)
    OR (t.block_timestamp >= 1646728973000000000
        AND t.block_timestamp <= 1646730473000000000)
    OR (t.block_timestamp >= 1646729110000000000
        AND t.block_timestamp <= 1646730610000000000)
    OR (t.block_timestamp >= 1646729307000000000
        AND t.block_timestamp <= 1646730807000000000)
    OR (t.block_timestamp >= 1646733868000000000
        AND t.block_timestamp <= 1646735368000000000)
    OR (t.block_timestamp >= 1646734039000000000
        AND t.block_timestamp <= 1646735539000000000)
    OR (t.block_timestamp >= 1651504866000000000
        AND t.block_timestamp <= 1651506366000000000)
    OR (t.block_timestamp >= 1659424977000000000
        AND t.block_timestamp <= 1659426477000000000);


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
    LEFT JOIN RECEIPTS R ON T.CONVERTED_INTO_RECEIPT_ID = R.RECEIPT_ID
    LEFT JOIN ACTION_RECEIPT_ACTIONS ARA ON ARA.RECEIPT_ID = R.RECEIPT_ID
WHERE (t.block_timestamp >= 1632824080000000000
    AND t.block_timestamp <= 1632825580000000000)
    OR (t.block_timestamp >= 1646392507000000000
        AND t.block_timestamp <= 1646394007000000000)
    OR (t.block_timestamp >= 1646393141000000000
        AND t.block_timestamp <= 1646394641000000000)
    OR (t.block_timestamp >= 1646393197000000000
        AND t.block_timestamp <= 1646394697000000000)
    OR (t.block_timestamp >= 1646393287000000000
        AND t.block_timestamp <= 1646394787000000000)
    OR (t.block_timestamp >= 1646393379000000000
        AND t.block_timestamp <= 1646394879000000000)
    OR (t.block_timestamp >= 1646393447000000000
        AND t.block_timestamp <= 1646394947000000000)
    OR (t.block_timestamp >= 1646393719000000000
        AND t.block_timestamp <= 1646395219000000000)
    OR (t.block_timestamp >= 1646394047000000000
        AND t.block_timestamp <= 1646395547000000000)
    OR (t.block_timestamp >= 1646394131000000000
        AND t.block_timestamp <= 1646395631000000000)
    OR (t.block_timestamp >= 1646394338000000000
        AND t.block_timestamp <= 1646395838000000000)
    OR (t.block_timestamp >= 1646394497000000000
        AND t.block_timestamp <= 1646395997000000000)
    OR (t.block_timestamp >= 1646394563000000000
        AND t.block_timestamp <= 1646396063000000000)
    OR (t.block_timestamp >= 1646394733000000000
        AND t.block_timestamp <= 1646396233000000000)
    OR (t.block_timestamp >= 1646727222000000000
        AND t.block_timestamp <= 1646728722000000000)
    OR (t.block_timestamp >= 1646727372000000000
        AND t.block_timestamp <= 1646728872000000000)
    OR (t.block_timestamp >= 1646727498000000000
        AND t.block_timestamp <= 1646728998000000000)
    OR (t.block_timestamp >= 1646727574000000000
        AND t.block_timestamp <= 1646729074000000000)
    OR (t.block_timestamp >= 1646728188000000000
        AND t.block_timestamp <= 1646729688000000000)
    OR (t.block_timestamp >= 1646728239000000000
        AND t.block_timestamp <= 1646729739000000000)
    OR (t.block_timestamp >= 1646728293000000000
        AND t.block_timestamp <= 1646729793000000000)
    OR (t.block_timestamp >= 1646728351000000000
        AND t.block_timestamp <= 1646729851000000000)
    OR (t.block_timestamp >= 1646728446000000000
        AND t.block_timestamp <= 1646729946000000000)
    OR (t.block_timestamp >= 1646728498000000000
        AND t.block_timestamp <= 1646729998000000000)
    OR (t.block_timestamp >= 1646728530000000000
        AND t.block_timestamp <= 1646730030000000000)
    OR (t.block_timestamp >= 1646728710000000000
        AND t.block_timestamp <= 1646730210000000000)
    OR (t.block_timestamp >= 1646728973000000000
        AND t.block_timestamp <= 1646730473000000000)
    OR (t.block_timestamp >= 1646729110000000000
        AND t.block_timestamp <= 1646730610000000000)
    OR (t.block_timestamp >= 1646729307000000000
        AND t.block_timestamp <= 1646730807000000000)
    OR (t.block_timestamp >= 1646733868000000000
        AND t.block_timestamp <= 1646735368000000000)
    OR (t.block_timestamp >= 1646734039000000000
        AND t.block_timestamp <= 1646735539000000000)
    OR (t.block_timestamp >= 1651504866000000000
        AND t.block_timestamp <= 1651506366000000000)
    OR (t.block_timestamp >= 1659424977000000000
        AND t.block_timestamp <= 1659426477000000000);


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
WHERE (t.block_timestamp >= 1632824080000000000
    AND t.block_timestamp <= 1632825580000000000)
    OR (t.block_timestamp >= 1646392507000000000
        AND t.block_timestamp <= 1646394007000000000)
    OR (t.block_timestamp >= 1646393141000000000
        AND t.block_timestamp <= 1646394641000000000)
    OR (t.block_timestamp >= 1646393197000000000
        AND t.block_timestamp <= 1646394697000000000)
    OR (t.block_timestamp >= 1646393287000000000
        AND t.block_timestamp <= 1646394787000000000)
    OR (t.block_timestamp >= 1646393379000000000
        AND t.block_timestamp <= 1646394879000000000)
    OR (t.block_timestamp >= 1646393447000000000
        AND t.block_timestamp <= 1646394947000000000)
    OR (t.block_timestamp >= 1646393719000000000
        AND t.block_timestamp <= 1646395219000000000)
    OR (t.block_timestamp >= 1646394047000000000
        AND t.block_timestamp <= 1646395547000000000)
    OR (t.block_timestamp >= 1646394131000000000
        AND t.block_timestamp <= 1646395631000000000)
    OR (t.block_timestamp >= 1646394338000000000
        AND t.block_timestamp <= 1646395838000000000)
    OR (t.block_timestamp >= 1646394497000000000
        AND t.block_timestamp <= 1646395997000000000)
    OR (t.block_timestamp >= 1646394563000000000
        AND t.block_timestamp <= 1646396063000000000)
    OR (t.block_timestamp >= 1646394733000000000
        AND t.block_timestamp <= 1646396233000000000)
    OR (t.block_timestamp >= 1646727222000000000
        AND t.block_timestamp <= 1646728722000000000)
    OR (t.block_timestamp >= 1646727372000000000
        AND t.block_timestamp <= 1646728872000000000)
    OR (t.block_timestamp >= 1646727498000000000
        AND t.block_timestamp <= 1646728998000000000)
    OR (t.block_timestamp >= 1646727574000000000
        AND t.block_timestamp <= 1646729074000000000)
    OR (t.block_timestamp >= 1646728188000000000
        AND t.block_timestamp <= 1646729688000000000)
    OR (t.block_timestamp >= 1646728239000000000
        AND t.block_timestamp <= 1646729739000000000)
    OR (t.block_timestamp >= 1646728293000000000
        AND t.block_timestamp <= 1646729793000000000)
    OR (t.block_timestamp >= 1646728351000000000
        AND t.block_timestamp <= 1646729851000000000)
    OR (t.block_timestamp >= 1646728446000000000
        AND t.block_timestamp <= 1646729946000000000)
    OR (t.block_timestamp >= 1646728498000000000
        AND t.block_timestamp <= 1646729998000000000)
    OR (t.block_timestamp >= 1646728530000000000
        AND t.block_timestamp <= 1646730030000000000)
    OR (t.block_timestamp >= 1646728710000000000
        AND t.block_timestamp <= 1646730210000000000)
    OR (t.block_timestamp >= 1646728973000000000
        AND t.block_timestamp <= 1646730473000000000)
    OR (t.block_timestamp >= 1646729110000000000
        AND t.block_timestamp <= 1646730610000000000)
    OR (t.block_timestamp >= 1646729307000000000
        AND t.block_timestamp <= 1646730807000000000)
    OR (t.block_timestamp >= 1646733868000000000
        AND t.block_timestamp <= 1646735368000000000)
    OR (t.block_timestamp >= 1646734039000000000
        AND t.block_timestamp <= 1646735539000000000)
    OR (t.block_timestamp >= 1651504866000000000
        AND t.block_timestamp <= 1651506366000000000)
    OR (t.block_timestamp >= 1659424977000000000
        AND t.block_timestamp <= 1659426477000000000);

