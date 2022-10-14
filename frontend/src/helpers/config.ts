import { stringToBoolean } from '../../../shared/helpers/strings';

export const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT;
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const ALLOW_DELETING_FROM_DATABASE: boolean = stringToBoolean(process.env.REACT_APP_ALLOW_DELETING_FROM_DATABASE ?? 'false');
export const defaultRequestOptions = {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
};
// export const ACCOUNT_UPDATE_POLLING_INTERVAL: number = Number(process.env.REACT_APP_ACCOUNT_UPDATE_POLLING_INTERVAL) ?? 30_000; // Note, this version is dangerous because it results in `NaN` which then causes hammering of the backend. Use the following line instead:
export const ACCOUNT_UPDATE_POLLING_INTERVAL: number = process.env.REACT_APP_ACCOUNT_UPDATE_POLLING_INTERVAL
  ? Number(process.env.REACT_APP_ACCOUNT_UPDATE_POLLING_INTERVAL)
  : 30_000;
console.log({ ACCOUNT_UPDATE_POLLING_INTERVAL });
