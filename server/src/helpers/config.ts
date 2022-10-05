export const CONNECTION_STRING = process.env.POSTGRESQL_CONNECTION_STRING;
export const DEFAULT_LENGTH = 100; // TODO: Document and consider renaming.
export const mongoConnectionString = process.env.MONGO ?? '';
export const port = process.env.PORT;
console.log({ mongoConnectionString });
