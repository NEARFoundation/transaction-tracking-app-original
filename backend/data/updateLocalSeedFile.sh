
# Run this file like `POSTGRESQL_CONNECTION_STRING=___ ./backend/data/updateLocalSeedFile.sh`, but replace ___ with your 
# value for POSTGRESQL_CONNECTION_STRING from your `backend/.env.development.local` file.

# TABLES is a variable storing comma-separated table names each prepended with "temp_test_export_". These are the 6 tables of the indexer database that this app needs to read from. The prefix is meant to clarify to anyone who happens to be browsing the private indexer DB at the time that these tables are special ephemeral tables that are about to be deleted.
TABLES=temp_test_export_transactions,temp_test_export_receipts,temp_test_export_execution_outcomes,temp_test_export_blocks,temp_test_export_action_receipt_actions,temp_test_export_transaction_actions
chosenTables=''

# https://stackoverflow.com/a/35894538/
for i in ${TABLES//,/ }
do
    chosenTables="$chosenTables --table=$i"
    echo "$chosenTables"
done


echo "Calling defineAccountIdsInSql..."
yarn ts-node  --esm ./backend/data/defineAccountIdsInSql.ts

echo "Merging accountIds.sql with tableDefinitions.sql..."
cat backend/data/accountIds.sql backend/data/tableDefinitions.sql > backend/data/createTempTablesFilteredToSpecificAccounts.sql

echo "Fixing the 'where' clauses within createTempTablesFilteredToSpecificAccounts..."
# TODO: Replace `WHERE T.TRANSACTION_HASH IN (SELECT transactionHash FROM transactionHashes);` and `WHERE ta.TRANSACTION_HASH IN (SELECT transactionHash FROM transactionHashes);` with appropriate clauses.

echo "Calling createTempTablesFilteredToSpecificAccounts..."
# Now that those 2 SQL files were merged into 1, it can be run to create the temporary tables that we need on the remote database (private indexer). Those tables will contain only the specific rows that are relevant to us based on the account IDs in our local environment variable (because of the WHERE clauses). Otherwise, downloading those tables would take up too much space on each engineer's local machine because they are hundreds of gigabytes each.
psql -Atx $POSTGRESQL_CONNECTION_STRING -af backend/data/createTempTablesFilteredToSpecificAccounts.sql

echo "Downloading temp tables as schemas + INSERT statements..."
# pg_dump downloads the data (as INSERT statements) to a file that gets committed to the repo because our tests will rely on this real-world data.
pg_dump $POSTGRESQL_CONNECTION_STRING $chosenTables --column-inserts > backend/data/seedData.sql

# Delete all of those temporary tables from the remote database (private indexer).
for i in ${TABLES//,/ }
do
    echo "Dropping $i..."
    psql -Atx $POSTGRESQL_CONNECTION_STRING -c "DROP TABLE IF EXISTS $i;";
done

# Clean the SQL insert commands so that they are ready for when a test file needs to use them to seed the local PostgreSQL database.
./backend/data/cleanTheSql.sh

echo "Finished updating the seed file. Run `yarn seed` to seed the database."

# TODO: Create a separate file that an engineer can run to execute the SQL to seed the local database. Set `yarn seed` to run it.