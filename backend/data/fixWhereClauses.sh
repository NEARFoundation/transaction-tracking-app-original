SQL_FILE=backend/data/createTempTablesFilteredToSpecificAccounts.sql


# --------------------------------------------------------
echo "Fixing the 'where' clauses within createTempTablesFilteredToSpecificAccounts..."

ACCOUNT_IDS=`cat backend/data/accountIds.csv`
echo "$ACCOUNT_IDS"
sed -i '' "s/WHERE T.TRANSACTION_HASH IN (SELECT transactionHash FROM transactionHashes);/WHERE T.receiver_account_id IN ($ACCOUNT_IDS);/" $SQL_FILE 
