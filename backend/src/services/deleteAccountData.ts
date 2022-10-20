import { type Request, type Response } from 'express';

import { OK, SERVER_ERROR } from '../../../shared/helpers/statusCodes.js';
import { stringToBoolean } from '../../../shared/helpers/strings.js';
import { TxActions } from '../models/TxActions.js';
import { TxTasks } from '../models/TxTasks.js';

const ALLOW_DELETING_FROM_DATABASE = stringToBoolean(process.env.ALLOW_DELETING_FROM_DATABASE ?? 'false');

// eslint-disable-next-line consistent-return
export const deleteAccountData = async (request: Request, response: Response) => {
  const { accountId } = request.body;
  console.log('deleteAccountData', { accountId });
  try {
    if (!ALLOW_DELETING_FROM_DATABASE) {
      throw new Error('ALLOW_DELETING_FROM_DATABASE is not enabled.');
    }

    await TxTasks.deleteMany({ accountId });
    await TxActions.deleteMany({ accountId });

    response.send(OK);
  } catch (error) {
    console.error(error);
    response.status(SERVER_ERROR).send({ error });
  }
};
