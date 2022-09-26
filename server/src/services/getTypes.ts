import { respondWithServerError } from '../../../shared/helpers/errors.js';

/* eslint-disable import/extensions */
import { TxTypes } from '../models/TxTypes.js';
/* eslint-enable import/extensions */

export const getTypes = async (request, response) => {
  try {
    const types = await TxTypes.aggregate([
      {
        $project: {
          _id: 0,
          label: '$name',
          value: '$name',
        },
      },
    ]);
    // console.log(types);
    response.send({ types });
  } catch (error) {
    respondWithServerError(response, error);
  }
};
