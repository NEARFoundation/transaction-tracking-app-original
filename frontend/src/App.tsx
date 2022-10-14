/* eslint-disable max-lines */
import { useState, useEffect } from 'react';

import getConfig from '../../shared/config';
import { getFormattedUtcDatetime, getDefaultStartUtc, getEndOfTodayUtc } from '../../shared/helpers/datetime';
import { BAD_REQUEST, SUCCESS } from '../../shared/helpers/statusCodes';
import { AccountId, OptionType } from '../../shared/types';

import { AccountUpdatedLabel } from './components/AccountUpdatedLabel';
import { AccountsTable } from './components/AccountsTable';
import { FormattingControls } from './components/FormattingControls';
import { MainTable } from './components/MainTable';
import { TransactionsFilterControls } from './components/TransactionsFilterControls';
import { ACCOUNT_UPDATE_POLLING_INTERVAL, API_BASE_URL, defaultRequestOptions, ENVIRONMENT } from './helpers/config';
import { getTransactionsCsv } from './helpers/csv';
import { logAndDisplayError } from './helpers/errors';
import { useLocalStorage } from './helpers/localStorage';
// eslint-disable-next-line import/no-unassigned-import
import './global.scss';
import { addTaskForAccountId, fetchTransactions, getTypes } from './helpers/transactions';

const nearConfig = getConfig(ENVIRONMENT);
console.log({ ENVIRONMENT, API_BASE_URL, nearConfig });
const { exampleAccount, explorerUrl } = nearConfig;

// eslint-disable-next-line max-lines-per-function
export default function App() {
  const [message, setMessage] = useState<string>('');
  const [messageCsv, setMessageCsv] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newAccountId, setNewAccountId] = useState<AccountId>('');
  const [selectedAccountId, setSelectedAccountId] = useState<AccountId>('');
  const [selectedAccountIdsForCsv, setSelectedAccountIdsForCsv] = useState<AccountId[]>([]);
  const [transactions, setTransactions] = useState([]);
  const [types, setTypes] = useState<OptionType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<OptionType[]>([]);
  const [csvTransactions, setCsvTransactions] = useState([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const [divisorPower, setDivisorPower] = useLocalStorage<number>('divisorPower', 9);
  const divisorPowerOptions = [0, 9, 24].map((x) => ({ value: x, label: x ? `1e${x}` : 1 }));
  const [decimalPlaces, setDecimalPlaces] = useLocalStorage<number>('decimalPlaces', 6);
  const decimalPlacesOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((x) => ({ value: x, label: x }));
  // console.log({ divisorPowerOptions, decimalPlacesOptions });
  const [startDate, setStartDate] = useLocalStorage<Date>('startDate', getDefaultStartUtc());
  const [endDate, setEndDate] = useLocalStorage<Date>('endDate', getEndOfTodayUtc());

  const initialAccountIds: AccountId[] = [];
  const [accountIds, setAccountIds] = useLocalStorage<AccountId[]>('accountIds', initialAccountIds); // These are the accounts shown in the table at the top.
  const [accountStatuses, setAccountStatuses] = useState<string[]>([]);

  const getTransactions = async (accountId: AccountId) => {
    setIsLoading(true);
    setSelectedAccountId(accountId);
    console.log('getTransactions', { accountId, start: getFormattedUtcDatetime(startDate), end: getFormattedUtcDatetime(endDate) });

    try {
      const response = await fetchTransactions(accountId, startDate, endDate, selectedTypes);
      const data = await response.json();
      console.log('Finished loading transactions. data.transactions[0] = ', data.transactions[0]);
      setIsLoading(false);
      setTransactions(data.transactions);
      if (data.lastUpdate > 0) {
        setLastUpdate(getFormattedUtcDatetime(data.lastUpdate));
      } else {
        setLastUpdate('');
      }
    } catch (error: any) {
      setTransactions([]);
      logAndDisplayError(error, setMessage);
    }
  };

  const fetchAccountStatuses = async () => {
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
      .catch((error: any) => {
        setAccountStatuses([]);
        logAndDisplayError(error, setMessage);
      });
  };

  const runTaskForThisAccount = async (accountId: AccountId) => {
    setMessage('');
    const requestOptions = {
      ...defaultRequestOptions,
      body: JSON.stringify({ accountId }),
    };
    await fetch(API_BASE_URL + '/runTaskForThisAccount', requestOptions)
      .then(async (response) => {
        await response.json();
      })
      .catch((error: any) => {
        console.error('There was an error!', error);
        setMessage('Unknown error!');
      });
    fetchAccountStatuses();
  };

  useEffect(() => {
    getTypes(setTypes, setMessage);
    fetchAccountStatuses();
    setInterval(() => {
      fetchAccountStatuses();
    }, ACCOUNT_UPDATE_POLLING_INTERVAL);
  }, []);

  useEffect(() => {
    setCsvTransactions([]);
    fetchAccountStatuses();
  }, [accountIds]);

  useEffect(() => {
    getTransactionsCsv({ selectedAccountIdsForCsv, setMessageCsv, startDate, endDate, selectedTypes, setCsvTransactions });
  }, [selectedAccountIdsForCsv]);

  useEffect(() => {
    setMessage('');
    if (selectedAccountId) {
      getTransactions(selectedAccountId);
    }

    setCsvTransactions([]);
  }, [startDate, endDate, selectedTypes]);

  const onChangeTypes = (value: any, event: any) => {
    if (event.action === 'select-option' && event.option.value === '*') {
      if (selectedTypes.length === types.length) {
        setSelectedTypes([]);
      } else {
        setSelectedTypes(types);
      }
    } else {
      setSelectedTypes(value);
    }
  };

  function onChangeDivisorPower(chosenOption: OptionType, event: any) {
    const { value } = chosenOption;
    console.log('onChangeDivisorPower', { value, event });
    setDivisorPower(Number(value));
  }

  function onChangeDecimalPlaces(chosenOption: OptionType, event: any) {
    const { value } = chosenOption;
    console.log('onChangeDecimalPlaces', { value, event });
    setDecimalPlaces(Number(value));
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
          if (!accountIds.includes(accountId)) {
            setAccountIds([...accountIds, accountId]);
          }
        } else if (response.status === BAD_REQUEST) {
          const status = await response.json();
          setMessage(status.error);
          console.error(status.error);
        }
      })
      .catch((error: any) => {
        logAndDisplayError(error, setMessage);
      });
  };

  const addNewAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('addNewAccount', newAccountId);
    if (newAccountId) {
      await addTasks(newAccountId);
      setNewAccountId('');
    }
  };

  return (
    <main>
      <nav>
        <h1>NEAR Transactions Accounting Report</h1>
        <AccountsTable
          {...{
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
            runTaskForThisAccount,
            messageCsv,
            csvTransactions,
            endDate,
            newAccountId,
            startDate,
          }}
        />
        {message ? <div className="msg">{message}</div> : null}
        <div>
          <FormattingControls {...{ divisorPowerOptions, divisorPower, onChangeDivisorPower, decimalPlacesOptions, decimalPlaces, onChangeDecimalPlaces }} />
          <hr />
          <TransactionsFilterControls {...{ accountIds, startDate, setStartDate, endDate, setEndDate, types, selectedTypes, onChangeTypes }} />
          <hr />
        </div>
      </nav>
      <div style={{ paddingTop: '10px', textAlign: 'center' }}>
        <AccountUpdatedLabel {...{ selectedAccountId, lastUpdate, isLoading }} />
        {transactions.length > 0 ? (
          <>
            <MainTable {...{ transactions, explorerUrl, divisorPower, decimalPlaces, isLoading }} />
          </>
        ) : null}
        {transactions.length === 0 && selectedAccountId ? <>{isLoading ? 'Loading...' : 'No data'}</> : null}
      </div>
    </main>
  );
}
