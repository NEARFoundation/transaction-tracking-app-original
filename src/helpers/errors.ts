export const logAndDisplayError = (error: string, setMessage: React.Dispatch<React.SetStateAction<string>>) => {
  console.error({ error });
  setMessage('Server error. If this keeps happening, please report to the Engineering team as many details as possible.');
};
