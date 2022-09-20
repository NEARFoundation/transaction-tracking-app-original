import nearApi from 'near-api-js';

/* eslint-disable import/extensions */
import getConfig from '../../../shared/config.js';
import { TxActions } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';
/* eslint-enable import/extensions */

const NODE_ENV = process.env.NODE_ENV || 'development';
const nearConfig = getConfig(NODE_ENV);

const { nodeUrl } = nearConfig;

const connectionInfo = { url: nodeUrl };
const provider = new nearApi.providers.JsonRpcProvider(connectionInfo);
const connection = new nearApi.Connection(nodeUrl, provider, {});

// eslint-disable-next-line consistent-return
export const deleteAccountData = async (request, response) => {
  const { accountId } = request.body;
  console.log('deleteAccountData', { accountId });
  try {
    TxTasks.deleteMany({ accountId })
      .then()
      .catch((error) => console.error({ error }));
    TxActions.deleteMany({ accountId })
      .then()
      .catch((error) => console.error({ error }));
    response.send({ status: 'ok' });
  } catch (error) {
    console.error(error);
    response.status(500).send({ error });
  }
};
