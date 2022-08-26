export const ERROR_CODE_SERVER_ERROR = 500;

export const respondWithServerError = (response: any, error: any) => {
  console.log(error);
  response.status(ERROR_CODE_SERVER_ERROR).send({ error: 'Server error. Please try again.' });
};
