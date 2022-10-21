import util from 'util';

import chalk from 'chalk'; // https://www.npmjs.com/package/chalk

import { getFormattedUtcDatetimeNow } from './datetime.js';

const error = chalk.bold.red;
const warn = chalk.hex('#FFA500'); // Orange color
const success = chalk.green;
const info = chalk.gray;
const debug = chalk.blue;

type Arguments = any;

function getArgumentsPreserved(providedArguments: Arguments): string {
  // https://nodejs.org/en/knowledge/getting-started/how-to-use-util-inspect/
  // https://github.com/chalk/chalk/issues/118#issuecomment-1221385194
  return util.inspect(providedArguments, { colors: true, depth: null });
}

const originalLog = console.log; // https://developer.mozilla.org/en-US/docs/Web/API/console // https://stackoverflow.com/a/16259739/
console.log = function (...providedArguments: Arguments) {
  Reflect.apply(originalLog, this, [getFormattedUtcDatetimeNow(), ...providedArguments]);
};

const originalInfo = console.info;
console.info = function (...providedArguments: Arguments) {
  Reflect.apply(originalInfo, this, [getFormattedUtcDatetimeNow(), info(getArgumentsPreserved(providedArguments))]);
};

const originalDebug = console.debug;
console.debug = function (...providedArguments: Arguments) {
  Reflect.apply(originalDebug, this, [getFormattedUtcDatetimeNow(), debug(getArgumentsPreserved(providedArguments))]);
};

const originalWarn = console.warn;
console.warn = function (...providedArguments: Arguments) {
  Reflect.apply(originalWarn, this, [getFormattedUtcDatetimeNow(), warn(getArgumentsPreserved(providedArguments))]);
};

const originalError = console.error;
console.error = function (...providedArguments: Arguments) {
  Reflect.apply(originalError, this, [getFormattedUtcDatetimeNow(), error(getArgumentsPreserved(providedArguments))]);
};

/**
 * NOTE: Currently, importing this function is the only way that console.log, console.warn, and other functions get overwritten above.
 *
 * @param providedArguments
 */
export function logSuccess(...providedArguments: Arguments) {
  console.log(success(getArgumentsPreserved(providedArguments)));
}
