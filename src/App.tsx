/* eslint-disable max-lines */
import { useState, useEffect } from 'react';

import getConfig from '../shared/config';
import { getFormattedUtcDatetime, getDefaultStartUtc, getEndOfTodayUtc } from '../shared/helpers/datetime';
import { BAD_REQUEST, SUCCESS } from '../shared/helpers/statusCodes';
import { AccountId, OptionType } from '../shared/types';

import { AccountUpdatedLabel } from './components/AccountUpdatedLabel';
import { AccountsTable } from './components/AccountsTable';
import { FormattingControls } from './components/FormattingControls';
import { MainTable } from './components/MainTable';
import { TransactionsFilterControls } from './components/TransactionsFilterControls';
import { ACCOUNT_UPDATE_POLLING_INTERVAL, API_BASE_URL, defaultRequestOptions, ENVIRONMENT } from './helpers/config';
import { getTransactionsCsv } from './helpers/csv';
import { logAndDisplayError } from './helpers/errors';
import { useLocalStorage } from './helpers/localStorage';

import './global.css';

const nearConfig = getConfig(ENVIRONMENT);
console.log({ ENVIRONMENT, API_BASE_URL, nearConfig });
const { exampleAccount, explorerUrl } = nearConfig;

export async function addTaskForAccountId(accountId: AccountId) {
  console.log('addTaskForAccountId:', accountId);
  const requestOptions = {
    ...defaultRequestOptions,
    body: JSON.stringify({ accountId }),
  };
  return fetch(API_BASE_URL + '/addTasks', requestOptions);
}

// eslint-disable-next-line max-lines-per-function
export default function App() {
  const [message, setMessage] = useState<string>('');
  const [messageCsv, setMessageCsv] = useState<string>('');
  const [newAccountId, setNewAccountId] = useState<AccountId>('');
  const [selectedAccountId, setSelectedAccountId] = useState<AccountId>('');
  const [selectedAccountIdsForCsv, setSelectedAccountIdsForCsv] = useState<AccountId[]>([]);
  const [transactions, setTransactions] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [csvTransactions, setCsvTransactions] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');

  const [divisorPower, setDivisorPower] = useLocalStorage<number>('divisorPower', 9);
  const divisorPowerOptions = [0, 9].map((x) => ({ value: x, label: x ? `1e${x}` : 1 }));
  const [decimalPlaces, setDecimalPlaces] = useLocalStorage<number>('decimalPlaces', 6);
  const decimalPlacesOptions = [1, 2, 3, 4, 5, 6, 7, 8].map((x) => ({ value: x, label: x }));
  console.log({ divisorPowerOptions, decimalPlacesOptions });
  const [startDate, setStartDate] = useLocalStorage<Date>('startDate', getDefaultStartUtc());
  const [endDate, setEndDate] = useLocalStorage<Date>('endDate', getEndOfTodayUtc());

  const getTypes = async () => {
    const requestOptions = {
      ...defaultRequestOptions,
      method: 'GET',
    };
    await fetch(API_BASE_URL + '/types', requestOptions)
      .then(async (response) => {
        const json = await response.json();
        setTypes(json.types);
      })
      .catch((error) => {
        logAndDisplayError(error, setMessage);
      });
  };

  const initialAccountIds: AccountId[] = [];
  const [accountIds, setAccountIds] = useLocalStorage<AccountId[]>('accountIds', initialAccountIds); // These are the accounts shown in the table at the top.
  const [accountStatuses, setAccountStatuses] = useState<string[]>([]);

  const getTransactions = async (accountId: AccountId) => {
    setMessage('Receiving data...');
    setSelectedAccountId(accountId);
    console.log('getTransactions', { accountId, start: getFormattedUtcDatetime(startDate), end: getFormattedUtcDatetime(endDate) });
    const requestOptions = {
      ...defaultRequestOptions,
      body: JSON.stringify({
        accountId: [accountId],
        endDate,
        startDate,
        types: selectedTypes.map((option: OptionType) => option.value),
      }),
    };
    await fetch(API_BASE_URL + '/transactions', requestOptions)
      .then(async (response) => {
        const data = await response.json();
        // console.log('first transaction', data.transactions[0]);
        setTransactions(data.transactions);
        if (data.lastUpdate > 0) setLastUpdate(getFormattedUtcDatetime(data.lastUpdate));
        else setLastUpdate('');
      })
      .catch((error) => {
        setTransactions([]);
        logAndDisplayError(error, setMessage);
      });
  };

  const getAccounts = async () => {
    const requestOptions = {
      ...defaultRequestOptions,
      body: JSON.stringify({ accountIds }),
    };
    await fetch(API_BASE_URL + '/accounts', requestOptions)
      .then(async (response) => {
        const data = await response.json();
        // console.log(data['accounts']);
        setAccountStatuses(data.accounts);
      })
      .catch((error) => {
        setAccountStatuses([]);
        logAndDisplayError(error, setMessage);
      });
  };

  const runTask = async (accountId: AccountId) => {
    setMessage('');
    const requestOptions = {
      ...defaultRequestOptions,
      body: JSON.stringify({ accountId }),
    };
    await fetch(API_BASE_URL + '/runTask', requestOptions)
      .then(async (response) => {
        await response.json();
      })
      .catch((error) => {
        console.error('There was an error!', error);
        setMessage('Unknown error!');
      });
    getAccounts();
  };

  useEffect(() => {
    getTypes();
    getAccounts();
    setInterval(() => {
      getAccounts();
    }, ACCOUNT_UPDATE_POLLING_INTERVAL);
  }, []);

  useEffect(() => {
    setCsvTransactions([]);
    getAccounts();
  }, [accountIds]);

  useEffect(() => {
    getTransactionsCsv({ selectedAccountIdsForCsv, setMessageCsv, startDate, endDate, selectedTypes, setCsvTransactions });
  }, [selectedAccountIdsForCsv]);

  useEffect(() => {
    setMessage('');
    if (selectedAccountId) getTransactions(selectedAccountId);
    setCsvTransactions([]);
  }, [startDate, endDate, selectedTypes]);

  const onChangeTypes = (value: any, event: any) => {
    if (event.action === 'select-option' && event.option.value === '*') {
      if (selectedTypes.length === types.length) setSelectedTypes([]);
      else setSelectedTypes(types);
    } else {
      setSelectedTypes(value);
    }
  };

  function onChangeDivisorPower(chosenOption: any, event: any) {
    const { value } = chosenOption;
    console.log('onChangeDivisorPower', { value, event });
    setDivisorPower(value);
  }

  function onChangeDecimalPlaces(chosenOption: any, event: any) {
    const { value } = chosenOption;
    console.log('onChangeDecimalPlaces', { value, event });
    setDecimalPlaces(value);
  }

  const handleNewAccountIdInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    const accountId = event.currentTarget.value;
    setNewAccountId(accountId);
    console.log('handleNewAccountIdInputChange. accountId=', accountId);
  };

  const addTasks = async (accountId: AccountId) => {
    setMessage('');
    await addTaskForAccountId(accountId)
      .then(async (response) => {
        if (response.status === SUCCESS) {
          if (!accountIds.includes(accountId)) setAccountIds([...accountIds, accountId]);
        } else if (response.status === BAD_REQUEST) {
          const status = await response.json();
          setMessage(status.error);
          console.error(status.error);
        }
      })
      .catch((error) => {
        logAndDisplayError(error, setMessage);
      });
  };

  const addNewAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    // Temp note to self: this function was formerly called `handleSubmit`.
    event.preventDefault();
    console.log('addNewAccount', newAccountId);
    if (newAccountId) {
      await addTasks(newAccountId);
      setNewAccountId('');
    }
  };

  const accountsTableProps = {
    accountIds,
    accountStatuses,
    exampleAccount,
    handleNewAccountIdInputChange,
    selectedAccountId,
    getTransactions,
    addNewAccount,
    setAccountIds,
    selectedAccountIdsForCsv,
    setSelectedAccountIdsForCsv,
    runTask,
    messageCsv,
    csvTransactions,
    endDate,
    newAccountId,
    startDate,
  };
  // console.log({ accountsTableProps });

  return (
    <main>
      <nav>
        <h1>NEAR Transactions Accounting Report</h1>
        <AccountsTable {...accountsTableProps} />
        {message ? <div className="msg">{message}</div> : null}
        <div>
          <FormattingControls {...{ divisorPowerOptions, divisorPower, onChangeDivisorPower, decimalPlacesOptions, decimalPlaces, onChangeDecimalPlaces }} />
          <hr />
          <TransactionsFilterControls {...{ accountIds, startDate, setStartDate, endDate, setEndDate, types, selectedTypes, onChangeTypes }} />
          <hr />
        </div>
      </nav>
      <div style={{ paddingTop: '10px', textAlign: 'center' }}>
        <AccountUpdatedLabel {...{ selectedAccountId, lastUpdate }} />
        {transactions.length > 0 ? (
          <>
            <MainTable transactions={transactions} explorerUrl={explorerUrl} divisorPower={divisorPower} decimalPlaces={decimalPlaces} />
          </>
        ) : null}
        {transactions.length === 0 && selectedAccountId ? <>No data</> : null}
      </div>
    </main>
  );
}
