import { performance } from 'perf_hooks';

import mongoose from 'mongoose';
import pg, { type Client } from 'pg';

import { millisToMinutesAndSeconds } from '../../shared/helpers/datetime.js';
import { logger } from '../../shared/helpers/logging.js';
import { type AccountId, type TxTypeRow, type RowOfExpectedOutput } from '../../shared/types';
import { CONNECTION_TIMEOUT, DEFAULT_LENGTH, mongoConnectionString, PRODUCTION_POSTGRESQL_CONNECTION_STRING, QUERY_TIMEOUT, STATEMENT_TIMEOUT } from '../src/helpers/config.js';
import { TxTypes } from '../src/models/TxTypes.js';
import { expectedOutputFilename } from '../test_helpers/internal/defineTransactionHashesInSql.js';

import { getRowsOfExpectedOutput } from './csvToJson.js';

const connectionString = PRODUCTION_POSTGRESQL_CONNECTION_STRING;

/**
 * This function is nearly a duplicate of the one in `backend/src/helpers/updateTransactions.ts` but adjusted for benchmarking.
 */
async function getTransactionsFromIndexer(pgClient: Client, accountId: AccountId, txTypeName: string, blockTimestamp: number, length: number): Promise<number | null> {
  try {
    const txType: TxTypeRow | null = await TxTypes.findOne({ name: txTypeName });
    if (txType) {
      const startTime = performance.now();
      const result = await pgClient.query(txType.sql, [accountId, blockTimestamp.toString(), length]);
      const endTime = performance.now();
      const diff = endTime - startTime;

      return diff;
    } else {
      logger.error('TxType not found', txTypeName);
      return null;
    }
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
  const connection = await mongoose.connect(mongoConnectionString);
  const blockTimestamp = 0;
  const pgClient = new pg.Client({ connectionString, statement_timeout: STATEMENT_TIMEOUT, connectionTimeoutMillis: CONNECTION_TIMEOUT, query_timeout: QUERY_TIMEOUT });
  await pgClient.connect();
  // logger.info('pgClient connected');
  const rowsOfExpectedOutput: RowOfExpectedOutput[] = getRowsOfExpectedOutput(expectedOutputFilename);

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
