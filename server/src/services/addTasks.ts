import nearApi from 'near-api-js';

import { AccountId } from '../../../shared/types';
import { getNearApiConnection } from '../helpers/nearConnection.js';

import getConfig from '../../../shared/config.js';
import { TxTasks } from '../models/TxTasks.js';

const nearConfig = getConfig(process.env.NODE_ENV || 'development');

const { nodeUrl } = nearConfig;

const connection = getNearApiConnection(nodeUrl);

const accountExists = async (accountId: AccountId) => {
  try {
    await new nearApi.Account(connection, accountId).state();
    return true;
  } catch {
    return false;
  }
};

// eslint-disable-next-line consistent-return
export const addTasks = async (request, response) => {
  const { accountId } = request.body;
  console.log('addTasks', { accountId });
  try {
    if (!(await accountExists(accountId))) {
      return response.status(400).send({ error: `Account does not exist in ${nodeUrl}.` });
    }

    TxTasks.findOneAndUpdate({ accountId }, { accountId }, { upsert: true })
      .then()
      .catch((error) => console.error({ error }));
    response.send({ status: 'ok' });
  } catch (error) {
    console.error(error);
    response.status(500).send({ error });
  }
};
