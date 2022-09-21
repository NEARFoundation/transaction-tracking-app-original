import { getFormattedUtcDatetime } from '../../shared/helpers/datetime';
import { addTaskForAccountId, defaultRequestOptions } from '../App.js';
import { AccountId } from '../../shared/types';

const REACT_APP_API = process.env.REACT_APP_API;

const getAccountStatus = (accountsStatus, accountId: AccountId) => {
  if (accountsStatus.length > 0) {
    const result = accountsStatus.find((item) => {
      return item.accountId === accountId;
    });
    return result ? result : [];
  }

  return [];
};

async function deleteFromDb(accountId: AccountId) {
  console.log('deleteFromDb', accountId);
  const requestOptions = {
    ...defaultRequestOptions,
    body: JSON.stringify({ accountId }),
  };
  await fetch(REACT_APP_API + '/deleteAccountData', requestOptions)
    .then(async (response) => {
      const data = await response.json();
      console.log(data);
      addTaskForAccountId(accountId);
    })
    .catch((error) => {
      console.error(error);
    });
}

function AccountRow({ accountId, deleteFromLocalStorage, accountStatus, getTransactions }) {
  return (
    <tr>
      <td>
        <div className="accountId" title="Show transactions for this account" onClick={() => getTransactions(accountId)}>
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
        >
          Delete from localStorage
        </button>
      </td>
      <td>
        <button
          style={{ backgroundColor: 'red', color: 'black' }}
          onClick={() => {
            deleteFromLocalStorage(accountId);
            deleteFromDb(accountId);
          }}
        >
          Delete from DB
        </button>
      </td>
    </tr>
  );
}

function AddNewAccountForm({ addNewAccount, handleChange, newAccountId, exampleAccount, buttonText = 'Add' }) {
  return (
    <form onSubmit={addNewAccount}>
      <input type="text" onChange={handleChange} value={newAccountId} placeholder={exampleAccount} />
      <button type="submit" title="Add new account">
        {buttonText}
      </button>
    </form>
  );
}

export function AccountsTable({ accountIDs, getTransactions, setAccountIDs, accountsStatus, handleChange, newAccountId, addNewAccount, exampleAccount }) {
  // console.log({ accountIDs });

  function deleteFromLocalStorage(accountId: AccountId) {
    const newAccountIDs = accountIDs.filter((item) => item !== accountId);
    console.log('deleteFromLocalStorage', accountId, newAccountIDs);
    setAccountIDs(newAccountIDs);
  }

  const props = { addNewAccount, handleChange, newAccountId, exampleAccount };
  const inlineProps = { ...props, buttonText: '+' };
  return (
    <div style={{ textAlign: 'center' }}>
      {accountIDs.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Status</th>
                <th>Last Update</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {accountIDs.map((accountId: AccountId, index: number) => {
                const accountStatus = getAccountStatus(accountsStatus, accountId);
                const rowProps = { accountId, deleteFromLocalStorage, accountStatus, getTransactions };
                return <AccountRow {...rowProps} key={index} />;
              })}
              <tr key="addAccountId">
                <td>
                  <AddNewAccountForm {...inlineProps} />
                </td>
                <td></td>
                <td></td>
                <td></td>
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
