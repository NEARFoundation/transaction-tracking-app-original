# Before using this file, update the values for transactionHashes in server/test_helpers/createTempTablesOfRowsWithSpecificTransactions.sql.
# Run this file like `pgCreds=___ ./server/test_helpers/update_test_data.sh`, but replace ___ with your value for POSTGRESQL_CONNECTION_STRING.

TBL_PREFIX='temp_test_export_'
TABLES=temp_test_export_transactions,temp_test_export_receipts,temp_test_export_execution_outcomes,temp_test_export_blocks,temp_test_export_action_receipt_actions
chosenTables=''
SED_REPLACE="s/$TBL_PREFIX//g"
echo $SED_REPLACE

# https://stackoverflow.com/a/35894538/
for i in ${TABLES//,/ }
do
    chosenTables="$chosenTables --table=$i"
    echo "$chosenTables"
done

echo "Calling createTempTablesOfRowsWithSpecificTransactions..."
psql -Atx $pgCreds -af server/test_helpers/createTempTablesOfRowsWithSpecificTransactions.sql

echo "Downloading temp tables as schemas + INSERT statements..."
pg_dump $pgCreds $chosenTables --column-inserts > server/test_helpers/test_data.sql

for i in ${TABLES//,/ }
do
    echo "Dropping $i..."
    psql -Atx $pgCreds -c "DROP TABLE IF EXISTS $i;";
done

echo "Deleting $TBL_PREFIX from the insert statements..."
# https://stackoverflow.com/a/525612/
sed -i '' $SED_REPLACE server/test_helpers/test_data.sql

echo "Finished!"