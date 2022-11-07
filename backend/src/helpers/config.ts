import dotenv from 'dotenv';

import { subfolder } from '../../../shared/config.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dotenvResult = dotenv.config({ path: `./${subfolder}/.env.development.local` });
// console.log({ dotenvResult });

export const PRODUCTION_POSTGRESQL_CONNECTION_STRING = process.env.PRODUCTION_POSTGRESQL_CONNECTION_STRING; // intentionally using the production value for benchmarking
export const CONNECTION_STRING = process.env.POSTGRESQL_CONNECTION_STRING;
export const DEFAULT_LENGTH = 100; // TODO: Document and consider renaming and allowing to be configurable per environment.
// TODO: Consider allowing these values to be configurable per environment:
export const STATEMENT_TIMEOUT = 10 * 60 * 1_000; // 10 minutes in milliseconds. "number of milliseconds before a statement in query will time out" https://node-postgres.com/api/client
const queryTimeoutString = process.env.QUERY_TIMEOUT_MILLISECONDS;
export const QUERY_TIMEOUT = queryTimeoutString ? Number(queryTimeoutString) : undefined; // in milliseconds. undefined = no timeout. // "number of milliseconds before a query call will timeout" https://node-postgres.com/api/client
export const CONNECTION_TIMEOUT = 10 * 1_000; // 10 seconds in milliseconds. "number of milliseconds to wait for connection" https://node-postgres.com/api/client

export const CRON_SCHEDULE = process.env.CRON_SCHEDULE ?? '* * * * *'; // every minute
// '* * * * * *', // every second. Only for careful local development purposes. https://www.freeformatter.com/cron-expression-generator-quartz.html
// '*/10 * * * * *', // every 10 seconds. https://stackoverflow.com/a/59800039/ https://www.freeformatter.com/cron-expression-generator-quartz.html

export const accountIdsToCheckJson = process.env.ACCOUNT_IDS_TO_CHECK_JSON ?? '[]';

export const mongoConnectionString = process.env.MONGO ?? '';
export const port = process.env.PORT;
// console.log({ mongoConnectionString });
