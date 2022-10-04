import { respondWithServerError } from '../helpers/errors.js';
import { TxTypes } from '../models/TxTypes.js';

export const getTypes = async (request: any, response: any) => {
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
