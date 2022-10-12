# Before using this file, ensure that backend/test_helpers/expectedOutput.csv contains the values that you want.
# Run this file like `pgCreds=___ ./backend/test_helpers/updateTestData.sh`, but replace ___ with your value for POSTGRESQL_CONNECTION_STRING.

TABLES=temp_test_export_transactions,temp_test_export_receipts,temp_test_export_execution_outcomes,temp_test_export_blocks,temp_test_export_action_receipt_actions,temp_test_export_transaction_actions
chosenTables=''

# https://stackoverflow.com/a/35894538/
for i in ${TABLES//,/ }
do
    chosenTables="$chosenTables --table=$i"
    echo "$chosenTables"
done


echo "Calling defineTransactionHashesInSql..."
yarn ts-node  --esm ./backend/test_helpers/internal/defineTransactionHashesInSql.ts

echo "Merging transactionHashes.sql with tableDefinitions.sql..."
cat backend/test_helpers/internal/transactionHashes.sql backend/test_helpers/internal/tableDefinitions.sql > backend/test_helpers/internal/createTempTablesOfRowsWithSpecificTransactions.sql

echo "Calling createTempTablesOfRowsWithSpecificTransactions..."
psql -Atx $pgCreds -af backend/test_helpers/internal/createTempTablesOfRowsWithSpecificTransactions.sql

echo "Downloading temp tables as schemas + INSERT statements..."
pg_dump $pgCreds $chosenTables --column-inserts > backend/test_helpers/internal/testData.sql

for i in ${TABLES//,/ }
do
    echo "Dropping $i..."
    psql -Atx $pgCreds -c "DROP TABLE IF EXISTS $i;";
done

./backend/test_helpers/internal/cleanTheSql.sh

echo "Finished!"