import { TxTasks } from '../models/TxTasks.js';
import nearApi from 'near-api-js';
import getConfig from '../config.js';

const nearConfig = getConfig(process.env.NODE_ENV || 'development');

const { nodeUrl } = nearConfig;

const connectionInfo = { url: nodeUrl };
const provider = new nearApi.providers.JsonRpcProvider(connectionInfo);
const connection = new nearApi.Connection(nodeUrl, provider, {});

export const addTasks = async (req, res) => {
  try {
    if (!(await accountExists(req.body.accountId))) {
      return res.status(400).send({ error: 'Account does not exist' });
    }
    TxTasks.findOneAndUpdate({ accountId: req.body.accountId }, { accountId: req.body.accountId }, { upsert: true })
      .then()
      .catch((e) => console.log(e));
    res.send({ status: 'ok' });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: e });
  }
};

async function accountExists(accountId) {
  try {
    await new nearApi.Account(connection, accountId).state();
    return true;
  } catch (error) {
    return false;
  }
}
