export const CONNECTION_STRING = process.env.POSTGRESQL_CONNECTION_STRING;
export const DEFAULT_LENGTH = 100; // TODO: Document and consider renaming and allowing to be configurable per env.
export const TIMEOUT = 900_000; // 15 minutes // TODO: Document and consider renaming and allowing to be configurable per env.

export const CRON_SCHEDULE = process.env.CRON_SCHEDULE ?? '* * * * *'; // every minute
// '* * * * * *', // every second. Only for careful local development purposes. https://www.freeformatter.com/cron-expression-generator-quartz.html
// '*/10 * * * * *', // every 10 seconds. https://stackoverflow.com/a/59800039/ https://www.freeformatter.com/cron-expression-generator-quartz.html

export const mongoConnectionString = process.env.MONGO ?? '';
export const port = process.env.PORT;
console.log({ mongoConnectionString });
