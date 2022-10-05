export const CONNECTION_STRING = process.env.POSTGRESQL_CONNECTION_STRING;
export const DEFAULT_LENGTH = 100; // TODO: Document and consider renaming and allowing to be configurable per env.
export const TIMEOUT = 900_000; // 15 minutes // TODO: Document and consider renaming and allowing to be configurable per env.
export const mongoConnectionString = process.env.MONGO ?? '';
export const port = process.env.PORT;
console.log({ mongoConnectionString });
