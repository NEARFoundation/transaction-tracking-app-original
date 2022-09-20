import { getFormattedUtcDatetime } from '../../shared/helpers/datetime';

const getAccountStatus = (accountsStatus, accountId) => {
  if (accountsStatus.length > 0) {
    const result = accountsStatus.find((item) => {
      return item.accountId === accountId;
    });
    return result ? result : [];
  }

  return [];
};

export function AccountsTable({ accountIDs, getTransactions, setAccountIDs, accountsStatus, handleChange, newAccountId, addNewAccount, exampleAccount }) {
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
              {accountIDs.map((accountId, index) => {
                const accountStatus = getAccountStatus(accountsStatus, accountId);
                return (
                  <tr key={index}>
                    <td>
                      <div className="accountId" title="Show transactions for this account" onClick={() => getTransactions(accountId)}>
                        {accountId}
                      </div>
                    </td>
                    <td>{accountStatus ? accountStatus.status : null}</td>
                    <td>{accountStatus ? getFormattedUtcDatetime(accountStatus.lastUpdate) : null}</td>
                    <td>
                      <button style={{ backgroundColor: '#ccc', color: '#000000' }} onClick={() => setAccountIDs(accountIDs.filter((item) => item !== accountId))}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr key="addAccountId">
                <td>
                  <form onSubmit={addNewAccount}>
                    <input type="text" onChange={handleChange} value={newAccountId} placeholder="Add new account" />
                  </form>
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
          <form onSubmit={addNewAccount}>
            <input type="text" onChange={handleChange} value={newAccountId} placeholder={exampleAccount} />
            <button type="submit">Add</button>
          </form>
        </>
      )}
    </div>
  );
}
