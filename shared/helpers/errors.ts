export const ERROR_CODE_SERVER_ERROR = 500;

export const respondWithServerError = (response: any, error: any) => {
  console.error(error);
  response.status(ERROR_CODE_SERVER_ERROR).send({ error: 'Server error. Please try again.' });
};

export const logAndDisplayError = (error: string, setMessage: React.Dispatch<React.SetStateAction<string>>) => {
  console.error({ error });
  setMessage('Server error. If this keeps happening, please report to the Engineering team as many details as possible.');
};
