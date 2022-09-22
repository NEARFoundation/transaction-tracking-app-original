import React, { useState, useEffect } from 'react';
import './global.css';
import DatePicker from 'react-datepicker';
import CsvDownload from 'react-json-to-CSV';
import 'react-datepicker/dist/react-datepicker.css';
import MultiSelect from 'react-select';

import getConfig from '../shared/config';
import { getFormattedUtcDatetime, getCsvFilename, getBeginningOfTodayUtc, getEndOfTodayUtc } from '../shared/helpers/datetime';
import { logAndDisplayError } from '../shared/helpers/errors';

import { MainTable } from './components/MainTable';
import { AccountsTable } from './components/AccountsTable';

const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT ?? 'development';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const nearConfig = getConfig(ENVIRONMENT);
console.log({ ENVIRONMENT, API_BASE_URL, nearConfig });
const { exampleAccount, explorerUrl } = nearConfig;

export const defaultRequestOptions = {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
};

export async function addTaskForAccountId(accountId) {
  console.log('addTaskForAccountId:', accountId);
  const requestOptions = {
    ...defaultRequestOptions,
    body: JSON.stringify({ accountId }),
  };
  return fetch(API_BASE_URL + '/addTasks', requestOptions);
}

export default function App() {
  const [message, setMessage] = useState('');
  const [accountId, setNewAccountId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');
  const [prependFilenameWithAcctNames, setPrependFilenameWithAcctNames] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const saved = localStorage.getItem('rangeDate');
    const initialValue = JSON.parse(saved);
    if (initialValue) {
      return new Date(initialValue.startDate);
    } else {
      return getBeginningOfTodayUtc();
    }
  });
  const [endDate, setEndDate] = useState(() => {
    const saved = localStorage.getItem('rangeDate');
    const initialValue = JSON.parse(saved);
    if (initialValue) {
      return new Date(initialValue.endDate);
    } else {
      return getEndOfTodayUtc();
    }
  });

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

  const [accountIDs, setAccountIDs] = useState(() => {
    const saved = localStorage.getItem('accountIDs');
    const initialValue = JSON.parse(saved);
    return initialValue || [];
  });
  const [accountsStatus, setAccountsStatus] = useState([]);

  const getTransactions = async (accountId) => {
    setMessage('');
    setSelectedAccountId(accountId);
    console.log('getTransactions', { accountId, start: getFormattedUtcDatetime(startDate), end: getFormattedUtcDatetime(endDate) });
    const requestOptions = {
      ...defaultRequestOptions,
      body: JSON.stringify({
        accountId: [accountId],
        endDate,
        startDate,
        types: Array.isArray(selectedTypes) ? selectedTypes.map((x) => x.value) : [],
      }),
    };
    await fetch(API_BASE_URL + '/transactions', requestOptions)
      .then(async (response) => {
        const data = await response.json();
        console.log(data, data.transactions[0]);
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
    const localStorageAccountIds = localStorage.getItem('accountIDs');
    console.log({ localStorageAccountIds });
    const requestOptions = {
      ...defaultRequestOptions,
      body: JSON.stringify({ accountId: JSON.parse(localStorageAccountIds) }),
    };
    await fetch(API_BASE_URL + '/accounts', requestOptions)
      .then(async (response) => {
        const data = await response.json();
        // console.log(data['accounts']);
        setAccountsStatus(data.accounts);
      })
      .catch((error) => {
        setAccountsStatus([]);
        logAndDisplayError(error, setMessage);
      });
  };

  useEffect(() => {
    getTypes();
    getAccounts();
    setInterval(() => {
      getAccounts();
    }, 30_000);
  }, []);

  useEffect(() => {
    localStorage.setItem('accountIDs', JSON.stringify(accountIDs));
    setAllTransactions([]);
    getAccounts();
  }, [accountIDs]);

  useEffect(() => {
    setMessage('');
    if (selectedAccountId) getTransactions(selectedAccountId);
    localStorage.setItem('rangeDate', JSON.stringify({ endDate, startDate }));
    setAllTransactions([]);
  }, [startDate, endDate, selectedTypes]);

  const MultiSelectStyles = {
    valueContainer: (base) => ({
      ...base,
      maxHeight: 500,
      overflowY: 'auto',
    }),
  };

  const onChangeTypes = (value, event) => {
    if (event.action === 'select-option' && event.option.value === '*') {
      if (selectedTypes.length === types.length) setSelectedTypes([]);
      else setSelectedTypes(types);
    } else {
      setSelectedTypes(value);
    }
  };

  const getAllTransactions = async () => {
    setMessage('');
    console.log('getAllTransactions', accountIDs);
    const requestOptions = {
      ...defaultRequestOptions,
      body: JSON.stringify({
        accountId: accountIDs,
        endDate,
        startDate,
        types: Array.isArray(selectedTypes) ? selectedTypes.map((item) => item.value) : [],
      }),
    };
    await fetch(API_BASE_URL + '/transactions', requestOptions)
      .then(async (response) => {
        const data = await response.json();
        setAllTransactions(data.transactions);
        console.log(data.transactions);
        if (data.transactions.length === 0) setMessage('No transactions have been received yet. Please check back later.');
      })
      .catch((error) => {
        logAndDisplayError(error, setMessage);
        setAllTransactions([]);
      });
  };

  const handleChange = (event) => {
    const accountId = event.target.value;
    setNewAccountId(accountId);
    console.log('handleChange. accountId=', accountId);
  };

  const addTasks = async (accountId) => {
    setMessage('');
    await addTaskForAccountId(accountId)
      .then(async (response) => {
        if (response.status === 200) {
          if (!accountIDs.includes(accountId)) setAccountIDs([...accountIDs, accountId]);
        } else if (response.status === 400) {
          const status = await response.json();
          setMessage(status.error);
          console.error(status.error);
        }
      })
      .catch((error) => {
        logAndDisplayError(error, setMessage);
      });
  };

  const addNewAccount = async (event) => {
    event.preventDefault();
    console.log('addNewAccount', accountId);
    if (accountId) {
      await addTasks(accountId);
      setNewAccountId('');
    }
  };

  const accountsTableProps = { accountIDs, accountsStatus, exampleAccount, handleChange, newAccountId: accountId, getTransactions, addNewAccount, setAccountIDs };
  // console.log({ accountsTableProps });

  return (
    <main>
      <nav>
        <h1>NEAR Transactions Accounting Report</h1>
        <AccountsTable {...accountsTableProps} />
        {message ? <div className="msg">{message}</div> : null}
        <div>
          <hr />
          {accountIDs.length > 0 ? (
            <>
              <div style={{ paddingBottom: '6px', textAlign: 'center' }}>
                From: <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} showMonthDropdown showYearDropdown dateFormat="yyyy-MM-dd" />
                To: <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} showMonthDropdown showYearDropdown dateFormat="yyyy-MM-dd" />
              </div>

              <MultiSelect
                options={[{ label: '--- Select All ---', value: '*' }, ...types]}
                placeholder="Select transaction types"
                value={selectedTypes}
                className="my-react-select-container"
                onChange={onChangeTypes}
                setState={setSelectedTypes}
                isMulti
                styles={MultiSelectStyles}
              />

              {allTransactions.length > 0 ? (
                <>
                  <button onClick={getAllTransactions} style={{ backgroundColor: '#175730' }}>
                    Update data for the CSV file
                  </button>
                  <CsvDownload
                    data={allTransactions}
                    filename={getCsvFilename(prependFilenameWithAcctNames ? accountIDs : [], startDate, endDate)}
                    style={{ backgroundColor: '#175730' }}
                  >
                    Download CSV file
                  </CsvDownload>
                  <label style={{ fontSize: '0.7rem' }}>
                    <input type="checkbox" checked={prependFilenameWithAcctNames} onChange={(event) => setPrependFilenameWithAcctNames(event.target.checked)} /> Prepend filename w/
                    acct names
                  </label>
                </>
              ) : (
                <button onClick={getAllTransactions} style={{ backgroundColor: '#175730' }}>
                  Prepare data for the CSV file
                </button>
              )}
              <hr />
            </>
          ) : null}
        </div>
      </nav>
      <div style={{ paddingTop: '10px', textAlign: 'center' }}>
        {selectedAccountId ? (
          <>
            {lastUpdate ? (
              <div>
                {selectedAccountId}. Last update: {lastUpdate}
              </div>
            ) : (
              <div>{selectedAccountId}. Check back later</div>
            )}
          </>
        ) : null}

        {transactions.length > 0 ? (
          <>
            <MainTable transactions={transactions} explorerUrl={explorerUrl} />
          </>
        ) : null}
        {transactions.length === 0 && selectedAccountId ? <>No data</> : null}
      </div>
    </main>
  );
}
