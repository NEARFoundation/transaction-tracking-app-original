SQL_FILE=backend/data/createTempTablesFilteredToSpecificAccounts.sql


# --------------------------------------------------------
echo "Fixing the 'where' clauses within createTempTablesFilteredToSpecificAccounts..."

sed -i '' 's/WHERE T.TRANSACTION_HASH IN (SELECT transactionHash FROM transactionHashes);/WHERE T.receiver_account_id IN (SELECT accountId FROM accountIds);/' $SQL_FILE 
