import { getFormattedUtcDatetime, getRelativeTimeOrUtc } from '../../../shared/helpers/datetime';
import { AccountId, AccountRowProps } from '../../../shared/types';
import { ALLOW_DELETING_FROM_DATABASE, API_BASE_URL, defaultRequestOptions } from '../helpers/config';
import { addTaskForAccountId } from '../helpers/transactions';

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
export default function AccountRow({
  accountId,
  deleteFromLocalStorage,
  accountStatus,
  getTransactions,
  selectedAccountId,
  runTaskForThisAccount,
  selectedAccountIdsForCsv,
  addAccountCsv,
}: AccountRowProps) {
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
  const utc = accountStatus?.lastUpdate ? getFormattedUtcDatetime(new Date(accountStatus.lastUpdate)) : '';
  return (
    <tr>
      <td>
        <div className={selectedAccountId === accountId ? 'accountIdSelected' : 'accountId'} title="Show transactions for this account" onClick={() => getTransactions(accountId)}>
          {accountId}
        </div>
      </td>
      <td>{accountStatus ? accountStatus.status : null}</td>
      <td className="fixed-width" title={utc}>
        {getRelativeTimeOrUtc(utc)}
      </td>
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
        <button className="silverBtn" onClick={() => runTaskForThisAccount(accountId)}>
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
