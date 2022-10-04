import { SERVER_ERROR } from '../../../shared/helpers/statusCodes.js';

export const respondWithServerError = (response: any, error: any) => {
  console.error(error);
  response.status(SERVER_ERROR).send({ error: 'Server error. Please try again.' });
};
