import { performance } from 'perf_hooks';

import mongoose from 'mongoose';
import pg, { type Client } from 'pg';

import { millisToMinutesAndSeconds } from '../../shared/helpers/datetime.js';
import { logger } from '../../shared/helpers/logging.js';
import { type AccountId, type RowOfExpectedOutput } from '../../shared/types';
import { getSqlFolder, getTransactionTypeSql } from '../src/helpers/addDefaultTypesTx.js';
import { CONNECTION_TIMEOUT, DEFAULT_LENGTH, MONGO_CONNECTION_STRING, PRODUCTION_POSTGRESQL_CONNECTION_STRING, QUERY_TIMEOUT, STATEMENT_TIMEOUT } from '../src/helpers/config.js';
import { EXPECTED_OUTPUT_FILENAME } from '../test_helpers/internal/defineTransactionHashesInSql.js';

import { getRowsOfExpectedOutput } from './csvToJson.js';

const connectionString = PRODUCTION_POSTGRESQL_CONNECTION_STRING;

/**
 * This function partially duplicates the one in `backend/src/helpers/updateTransactions.ts` but adjusted for benchmarking.
 */
async function getTransactionsFromIndexer(pgClient: Client, accountId: AccountId, txTypeName: string, blockTimestamp: number, length: number): Promise<number | null> {
  try {
    const sqlFolder = getSqlFolder();
    const sql = getTransactionTypeSql(sqlFolder, `${txTypeName}.sql`);
    const startTime = performance.now();
    const result = await pgClient.query(sql, [accountId, blockTimestamp.toString(), length]);
    const endTime = performance.now();
    const diff = endTime - startTime;
    return diff;
  } catch (error) {
    logger.error('getTransactionsFromIndexer', error);
    return null;
  }
}

type Results = {
  [key: string]: {
    diff: number;
    humanReadableDiff: string | null;
  };
};

async function runBenchmark() {
  const connection = await mongoose.connect(MONGO_CONNECTION_STRING);
  const blockTimestamp = 0;
  const pgClient = new pg.Client({ connectionString, statement_timeout: STATEMENT_TIMEOUT, connectionTimeoutMillis: CONNECTION_TIMEOUT, query_timeout: QUERY_TIMEOUT });
  await pgClient.connect();
  // logger.info('pgClient connected');
  const rowsOfExpectedOutput: RowOfExpectedOutput[] = getRowsOfExpectedOutput(EXPECTED_OUTPUT_FILENAME);

  // console.log({ rowsOfExpectedOutput });
  const results: Results = {};
  const missingTxTypeErrors: string[] = [];

  for (const rowOfExpectedOutput of rowsOfExpectedOutput) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { accountId, txType } = rowOfExpectedOutput;
    logger.info(`Awaiting getTransactionsFromIndexer for ${txType}`);
    const diff = await getTransactionsFromIndexer(pgClient, accountId, txType, blockTimestamp, DEFAULT_LENGTH);
    if (diff) {
      const humanReadableDiff = millisToMinutesAndSeconds(diff);
      results[txType] = { diff, humanReadableDiff };
    } else {
      missingTxTypeErrors.push(txType);
    }
  }

  await pgClient.end();
  await connection.disconnect();
  const sortable = Object.fromEntries(
    Object.entries(results).sort(([, a], [, b]) => {
      return b.diff - a.diff;
    }),
  );
  logger.info('result', { sortable, missingTxTypeErrors }, JSON.stringify(sortable));
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
runBenchmark();
