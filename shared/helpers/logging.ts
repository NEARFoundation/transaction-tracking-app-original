import util from 'util';

import chalk from 'chalk'; // https://www.npmjs.com/package/chalk

import { getFormattedUtcDatetimeNow } from './datetime.js';

const success = chalk.bgGreen;

const styles = {
  log: chalk,
  error: chalk.bold.red,
  warn: chalk.hex('#FFA500'), // Orange color
  info: chalk.gray,
  debug: chalk.blue,
};

type Arguments = any;

function getArgumentsPreserved(providedArguments: Arguments): string {
  // https://stackoverflow.com/a/74163827/
  // https://nodejs.org/en/knowledge/getting-started/how-to-use-util-inspect/
  // https://github.com/chalk/chalk/issues/118#issuecomment-1221385194

  return providedArguments.map((providedArgument: Arguments) => util.inspect(providedArgument, { colors: false, depth: null })).join(' ');
}

for (const style of Object.keys(styles) as Array<keyof Console>) {
  const originalStyle = console[style];
  const callback = styles[style];
  console[style] = function (...providedArguments: Arguments) {
    Reflect.apply(originalStyle, this, [getFormattedUtcDatetimeNow(), callback(getArgumentsPreserved(providedArguments))]);
  };
}

/**
 * NOTE: Currently, importing this function is the only way that console.log, console.warn, and other functions get overwritten above.
 *
 * @param providedArguments
 */
export function logSuccess(...providedArguments: Arguments) {
  console.log(success(getArgumentsPreserved(providedArguments)));
}
