import { getFormattedUtcDatetime } from '../../shared/helpers/datetime';
import { AccountId, AccountRowProps, AccountsTableProps } from '../../shared/types';
import { addTaskForAccountId } from '../App';
import { ALLOW_DELETING_FROM_DATABASE, API_BASE_URL, defaultRequestOptions } from '../helpers/config';
import { handleExportCsv } from '../helpers/csv';

const getAccountStatus = (accountStatuses: any, accountId: AccountId) => {
  if (accountStatuses.length > 0) {
    const result = accountStatuses.find((item: any) => {
      return item.accountId === accountId;
    });
    return result ? result : [];
  }

  return [];
};

const sometimesEmptyHeader = ALLOW_DELETING_FROM_DATABASE ? <th></th> : <></>;
const csvDownloadButtonColSpan = ALLOW_DELETING_FROM_DATABASE ? 4 : 3;

async function deleteFromDatabase(accountId: AccountId) {
  console.log('deleteFromDb', accountId);
  const requestOptions = {
    ...defaultRequestOptions,
    body: JSON.stringify({ accountId }),
  };
  await fetch(API_BASE_URL + '/deleteAccountData', requestOptions)
    .then(async (response) => {
      const data = await response.json();
      console.log(data);
      addTaskForAccountId(accountId);
    })
    .catch((error) => {
      console.error(error);
    });
}

// eslint-disable-next-line max-lines-per-function
function AccountRow({ accountId, deleteFromLocalStorage, accountStatus, getTransactions, selectedAccountId, runTask, selectedAccountIdsForCsv, addAccountCsv }: AccountRowProps) {
  const deleteFromDatabaseCell = ALLOW_DELETING_FROM_DATABASE ? (
    <td>
      <button
        style={{ backgroundColor: 'red', color: 'black' }}
        onClick={() => {
          deleteFromLocalStorage(accountId);
          deleteFromDatabase(accountId);
        }}
      >
        Delete from DB
      </button>
    </td>
  ) : (
    <></>
  );
  return (
    <tr>
      <td>
        <div className={selectedAccountId === accountId ? 'accountIdSelected' : 'accountId'} title="Show transactions for this account" onClick={() => getTransactions(accountId)}>
          {accountId}
        </div>
      </td>
      <td>{accountStatus ? accountStatus.status : null}</td>
      <td className="fixed-width">{accountStatus ? getFormattedUtcDatetime(accountStatus.lastUpdate) : null}</td>
      <td>
        <button
          style={{ backgroundColor: '#ccc', color: 'black' }}
          onClick={() => {
            deleteFromLocalStorage(accountId);
          }}
          title="Delete from localStorage"
        >
          Delete
        </button>
        <button className="silverBtn" onClick={() => runTask(accountId)}>
          Update now
        </button>
      </td>
      <td>
        <input type="checkbox" checked={selectedAccountIdsForCsv.includes(accountId)} value={accountId} onChange={addAccountCsv} />
      </td>
      {deleteFromDatabaseCell}
    </tr>
  );
}

function AddNewAccountForm({ addNewAccount, handleNewAccountIdInputChange, newAccountId, exampleAccount, buttonText = 'Add' }) {
  return (
    <form onSubmit={addNewAccount}>
      <input type="text" onChange={handleNewAccountIdInputChange} value={newAccountId} placeholder={exampleAccount} />
      <button type="submit" title="Add new account" className="silverBtn">
        {buttonText}
      </button>
    </form>
  );
}

// eslint-disable-next-line max-lines-per-function
export function AccountsTable({
  accountIds,
  setAccountIds,
  accountStatuses,
  handleNewAccountIdInputChange,
  addNewAccount,
  exampleAccount,
  selectedAccountIdsForCsv,
  setSelectedAccountIdsForCsv,
  messageCsv,
  csvTransactions,
  newAccountId,
  startDate,
  endDate,
  getTransactions,
  runTask,
  selectedAccountId,
}: AccountsTableProps) {
  // console.log({ accountIds });

  function deleteFromLocalStorage(accountIdToDelete: AccountId) {
    const newAccountIDs = accountIds.filter((item: any) => item !== accountIdToDelete);
    console.log('deleteFromLocalStorage', accountIdToDelete, newAccountIDs);
    setAccountIds(newAccountIDs);
  }

  const addAccountCsv = (event: any) => {
    const { value, checked } = event.target;
    setSelectedAccountIdsForCsv([...selectedAccountIdsForCsv, value]);
    if (!checked) {
      setSelectedAccountIdsForCsv(selectedAccountIdsForCsv.filter((item: any) => item !== value));
    }
  };

  const handleSelectAll = (event: any) => {
    const { checked } = event.target;
    if (checked) setSelectedAccountIdsForCsv(accountIds);
    else setSelectedAccountIdsForCsv([]);
  };

  const props = { addNewAccount, handleNewAccountIdInputChange, exampleAccount, newAccountId };
  const inlineProps = { ...props, buttonText: '+' };
  return (
    <div style={{ textAlign: 'center' }}>
      {accountIds.length > 0 ? (
        <>
          <table className="accountsTable">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Status</th>
                <th>Last Update</th>
                <th></th>
                <th>
                  <input type="checkbox" onChange={handleSelectAll} />
                </th>
                {sometimesEmptyHeader}
              </tr>
            </thead>
            <tbody>
              {accountIds.map((accountIdForRow: AccountId, index: number) => {
                const accountStatus = getAccountStatus(accountStatuses, accountIdForRow);
                const rowProps = {
                  accountId: accountIdForRow,
                  deleteFromLocalStorage,
                  accountStatus,
                  getTransactions,
                  runTask,
                  selectedAccountId,
                  selectedAccountIdsForCsv,
                  addAccountCsv,
                };
                return <AccountRow {...rowProps} key={index} />;
              })}
              <tr key="addAccountId">
                <td colSpan={2} className="max-width-none">
                  <AddNewAccountForm {...inlineProps} />
                </td>
                <td colSpan={csvDownloadButtonColSpan} style={{ textAlign: 'right' }}>
                  {csvTransactions.length > 0 ? (
                    <button
                      className="downloadBtn"
                      onClick={() => {
                        handleExportCsv(csvTransactions, startDate, endDate, accountIds);
                      }}
                    >
                      Download as CSV
                    </button>
                  ) : (
                    messageCsv
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      ) : (
        <>
          <p>Enter the account ID:</p>
          <AddNewAccountForm {...props} />
        </>
      )}
    </div>
  );
}
