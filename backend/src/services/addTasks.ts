import { type Request, type Response } from 'express';
import * as nearAPI from 'near-api-js'; // https://docs.near.org/tools/near-api-js/quick-reference#import

import getConfig from '../../../shared/config.js';
import { BAD_REQUEST, OK, SERVER_ERROR } from '../../../shared/helpers/statusCodes.js';
import { type AccountId } from '../../../shared/types';
import { getNearApiConnection } from '../helpers/nearConnection.js';
import { TxTasks } from '../models/TxTasks.js';

const nearConfig = getConfig();

const { nodeUrl } = nearConfig;

const TOP_LEVEL_ACCOUNT_SUFFIX = '.near'; // Should this come from shared/config.ts?

const connection = getNearApiConnection(nodeUrl);

const accountExists = async (accountId: AccountId) => {
  try {
    await new nearAPI.Account(connection, accountId).state();
    return true;
  } catch {
    return false;
  }
};

// eslint-disable-next-line consistent-return
export const addTasks = async (request: Request, response: Response) => {
  const { accountId } = request.body;
  console.log('addTasks', { accountId });
  try {
    if (!accountId.endsWith(TOP_LEVEL_ACCOUNT_SUFFIX)) {
      return response.status(BAD_REQUEST).send({ error: `Not allowed. Account ID must end with '${TOP_LEVEL_ACCOUNT_SUFFIX}'.` });
    }

    if (!(await accountExists(accountId))) {
      return response.status(BAD_REQUEST).send({ error: `Account does not exist in ${nodeUrl}.` });
    }

    await TxTasks.findOneAndUpdate({ accountId }, { accountId }, { upsert: true });

    response.send(OK);
  } catch (error) {
    console.error(error);
    response.status(SERVER_ERROR).send({ error });
  }
};
