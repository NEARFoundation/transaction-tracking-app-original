import { type OptionType, type AccountId } from '../../../shared/types';

import { defaultRequestOptions, API_BASE_URL } from './config';
import { logAndDisplayError } from './errors';

export async function addTaskForAccountId(accountId: AccountId): Promise<Response> {
  console.log('addTaskForAccountId:', accountId);
  const requestOptions = {
    ...defaultRequestOptions,
    body: JSON.stringify({ accountId }),
  };
  return fetch(API_BASE_URL + '/addTasks', requestOptions);
}

export const getTypes = async (setTypes: (types: OptionType[]) => void, setMessage: (message: string) => void): Promise<void> => {
  const requestOptions = {
    ...defaultRequestOptions,
    method: 'GET',
  };
  try {
    const response: Response = await fetch(API_BASE_URL + '/types', requestOptions);
    const json = await response.json();
    setTypes(json.types);
  } catch (error: any) {
    logAndDisplayError(error, setMessage);
  }
};

export async function fetchTransactions(accountId: AccountId, startDate: Date, endDate: Date, selectedTypes: OptionType[]): Promise<Response> {
  const requestOptions = {
    ...defaultRequestOptions,
    body: JSON.stringify({
      accountId: [accountId],
      endDate,
      startDate,
      types: selectedTypes.map((option: OptionType) => option.value),
    }),
  };
  return fetch(API_BASE_URL + '/transactions', requestOptions);
}
