# Before using this file, ensure that backend/test_helpers/expectedOutput.csv contains the values that you want.
# Run this file like `yarn update_test_data`.

# TABLES is a variable storing comma-separated table names each prepended with "temp_test_export_". These are the 6 tables of the indexer database that this app needs to read from. The prefix is meant to clarify to anyone who happens to be browsing the private indexer DB at the time that these tables are special ephemeral tables that are about to be deleted.
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
cat backend/test_helpers/internal/transactionHashes.sql backend/data/tableDefinitions.sql > backend/test_helpers/internal/createTempTablesOfRowsWithSpecificTransactions.sql

echo "Calling createTempTablesOfRowsWithSpecificTransactions..."
# Now that those 2 SQL files were merged into 1, it can be run to create the temporary tables that we need on the remote database (private indexer). Those tables will contain only the specific rows that our tests care about (because of the WHERE clauses). Otherwise, downloading those tables would take up too much space on each engineer's local machine because they are hundreds of gigabytes each.
psql -Atx $PRODUCTION_POSTGRESQL_CONNECTION_STRING -af backend/test_helpers/internal/createTempTablesOfRowsWithSpecificTransactions.sql

echo "Downloading temp tables as schemas + INSERT statements..."
# pg_dump downloads the data (as INSERT statements) to a file that gets committed to the repo because our tests will rely on this real-world data.
pg_dump $PRODUCTION_POSTGRESQL_CONNECTION_STRING $chosenTables --column-inserts > backend/test_helpers/internal/testData.sql

# Delete all of those temporary tables from the remote database (private indexer).
for i in ${TABLES//,/ }
do
    echo "Dropping $i..."
    psql -Atx $PRODUCTION_POSTGRESQL_CONNECTION_STRING -c "DROP TABLE IF EXISTS $i;";
done

# Clean the SQL insert commands so that they are ready for when a test file needs to use them to seed the local PostgreSQL database.
SQL_FILE=backend/test_helpers/internal/testData.sql ./backend/data/cleanTheSql.sh

echo "Finished! testData.sql is now ready. Test suites can use it to seed the local database."