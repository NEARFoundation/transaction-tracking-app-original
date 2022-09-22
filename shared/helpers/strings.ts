export function stringToBoolean(string: string): boolean {
  // See also https://github.com/ladjs/dotenv-parse-variables/blob/85f20b928f214ff79d9f92821393e3269a587bf6/src/index.js#L59 mentioned at https://github.com/motdotla/dotenv/issues/51#issuecomment-236389758
  switch (string.toLowerCase().trim()) {
    case 'true':
    case 'yes':
    case '1':
      return true;
    case 'false':
    case 'no':
    case '0':
    case null:
      return false;
    default:
      return Boolean(string);
  }
}
