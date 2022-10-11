import * as Papa from 'papaparse';

import { getCsvFilename } from '../../../shared/helpers/datetime';
import { type CsvTransaction, type OptionType, type AccountId } from '../../../shared/types';

import { API_BASE_URL, defaultRequestOptions } from './config';

export const handleExportCsv = (csvTransactions: CsvTransaction[], startDate: Date, endDate: Date, accountIds: AccountId[]) => {
  if (csvTransactions.length > 0) {
    const csv = Papa.unparse(csvTransactions);
    const blob = new Blob([csv]);
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    const filename = getCsvFilename(accountIds, startDate, endDate);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

// eslint-disable-next-line max-lines-per-function
export const getTransactionsCsv = async ({ selectedAccountIdsForCsv, setMessageCsv, startDate, endDate, selectedTypes, setCsvTransactions }) => {
  if (selectedAccountIdsForCsv.length > 0) {
    setCsvTransactions([]);
    setMessageCsv('Please wait while the CSV file is being prepared');
    const requestOptions = {
      ...defaultRequestOptions,
      body: JSON.stringify({
        types: selectedTypes.map((option: OptionType) => option.value),
        accountId: selectedAccountIdsForCsv,
        startDate,
        endDate,
      }),
    };
    await fetch(API_BASE_URL + '/transactions', requestOptions)
      .then(async (response) => {
        const data = await response.json();
        setCsvTransactions(data.transactions);
        if (data.transactions.length === 0) {
          setMessageCsv('No data for the csv file');
        }
      })
      .catch((error) => {
        console.error('There was an error!', error);
        setMessageCsv('Unknown error!');
        setCsvTransactions([]);
      });
  } else {
    setCsvTransactions([]);
    setMessageCsv('');
  }
};
