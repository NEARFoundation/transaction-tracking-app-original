
# Run this file via `yarn update_local_seed_file`.

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
yarn ts-node  --esm ./backend/data/defineTransactionHashesInSql.ts

echo "Merging transactionHashes.sql with tableDefinitions.sql..."
cat backend/data/transactionHashes.sql backend/data/tableDefinitions.sql > backend/data/createTempTablesOfRowsWithSpecificTransactions.sql

echo "Calling createTempTablesFilteredToSpecificAccounts..."
# Create the temporary tables that we need on the remote database (private indexer). Those tables will contain only the specific rows that are relevant to us based on the account IDs in our local environment variable (because of the WHERE clauses). Otherwise, downloading those tables would take up too much space on each engineer's local machine because they are hundreds of gigabytes each.
psql -Atx $PRODUCTION_POSTGRESQL_CONNECTION_STRING -af backend/data/createTempTablesOfRowsWithSpecificTransactions.sql

echo "Downloading temp tables as schemas + INSERT statements..."
# pg_dump downloads the data (as INSERT statements) to a file that gets committed to the repo so that all engineers can start with the same basic data set.
pg_dump $PRODUCTION_POSTGRESQL_CONNECTION_STRING $chosenTables --column-inserts > backend/data/seedData.sql

# Delete all of those temporary tables from the remote database (private indexer).
for i in ${TABLES//,/ }
do
    echo "Dropping $i..."
    psql -Atx $PRODUCTION_POSTGRESQL_CONNECTION_STRING -c "DROP TABLE IF EXISTS $i;";
done

# Clean the SQL insert commands so that they are ready to be executed to seed the local PostgreSQL database.
SQL_FILE=backend/data/seedData.sql ./backend/data/cleanTheSql.sh

echo "Finished updating the seed file. Run 'yarn seed' to seed the database."

# TODO: Create a separate file that an engineer can run to execute the SQL to seed the local database. Set `yarn seed` to run it. It should use the local credentials at POSTGRESQL_CONNECTION_STRING in `backend/.env.development`.