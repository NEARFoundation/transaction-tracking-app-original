# Before using this file, run `yarn ts-node  --esm ./server/test_helpers/getTransactionHashes.ts`, and then update the values for transactionHashes in server/test_helpers/createTempTablesOfRowsWithSpecificTransactions.sql.
# Run this file like `pgCreds=___ ./server/test_helpers/updateTestData.sh`, but replace ___ with your value for POSTGRESQL_CONNECTION_STRING.

TABLES=temp_test_export_transactions,temp_test_export_receipts,temp_test_export_execution_outcomes,temp_test_export_blocks,temp_test_export_action_receipt_actions,temp_test_export_transaction_actions
chosenTables=''

# https://stackoverflow.com/a/35894538/
for i in ${TABLES//,/ }
do
    chosenTables="$chosenTables --table=$i"
    echo "$chosenTables"
done

echo "Calling createTempTablesOfRowsWithSpecificTransactions..."
psql -Atx $pgCreds -af server/test_helpers/createTempTablesOfRowsWithSpecificTransactions.sql

echo "Downloading temp tables as schemas + INSERT statements..."
pg_dump $pgCreds $chosenTables --column-inserts > server/test_helpers/testData.sql

for i in ${TABLES//,/ }
do
    echo "Dropping $i..."
    psql -Atx $pgCreds -c "DROP TABLE IF EXISTS $i;";
done

./server/test_helpers/cleanTheSql.sh

# This section is disabled since probably the Jest beforeAll function will seed the DB instead.
# echo "Calling updateTestDataSqlite.ts..."
# rm server/test_helpers/testData.db && ./server/node_modules/.bin/ts-node --esm server/test_helpers/updateTestDataSqlite.ts

echo "Finished!"