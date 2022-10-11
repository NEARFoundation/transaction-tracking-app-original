# Before using this file, update the values for transactionHashes in backend/test_helpers/createTempTablesOfRowsWithSpecificTransactions.sql.
# Run this file like `pgCreds=___ ./backend/test_helpers/updateTestData.sh`, but replace ___ with your value for POSTGRESQL_CONNECTION_STRING.

TABLES=temp_test_export_transactions,temp_test_export_receipts,temp_test_export_execution_outcomes,temp_test_export_blocks,temp_test_export_action_receipt_actions
chosenTables=''

# https://stackoverflow.com/a/35894538/
for i in ${TABLES//,/ }
do
    chosenTables="$chosenTables --table=$i"
    echo "$chosenTables"
done

echo "Calling createTempTablesOfRowsWithSpecificTransactions..."
psql -Atx $pgCreds -af backend/test_helpers/createTempTablesOfRowsWithSpecificTransactions.sql

echo "Downloading temp tables as schemas + INSERT statements..."
pg_dump $pgCreds $chosenTables --column-inserts > backend/test_helpers/testData.sql

for i in ${TABLES//,/ }
do
    echo "Dropping $i..."
    psql -Atx $pgCreds -c "DROP TABLE IF EXISTS $i;";
done

./backend/test_helpers/cleanTheSql.sh

# This section is disabled since probably the Jest beforeAll function will seed the DB instead.
# echo "Calling updateTestDataSqlite.ts..."
# rm backend/test_helpers/testData.db && ./backend/node_modules/.bin/ts-node --esm backend/test_helpers/updateTestDataSqlite.ts

echo "Finished!"