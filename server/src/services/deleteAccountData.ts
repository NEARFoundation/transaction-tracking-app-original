import { stringToBoolean } from '../../../shared/helpers/strings.js';
import { TxActions } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';

const ALLOW_DELETING_FROM_DATABASE = stringToBoolean(process.env.ALLOW_DELETING_FROM_DATABASE ?? 'false');

// eslint-disable-next-line consistent-return
export const deleteAccountData = async (request, response) => {
  const { accountId } = request.body;
  console.log('deleteAccountData', { accountId });
  try {
    if (!ALLOW_DELETING_FROM_DATABASE) {
      throw new Error('ALLOW_DELETING_FROM_DATABASE is not enabled.');
    }

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
