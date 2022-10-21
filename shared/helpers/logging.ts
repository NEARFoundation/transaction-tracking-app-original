import chalk from 'chalk'; // https://www.npmjs.com/package/chalk

import { getFormattedUtcDatetimeNow } from './datetime.js';

const error = chalk.bold.red;
const warn = chalk.hex('#FFA500'); // Orange color
const success = chalk.green;
const info = chalk.gray;
const debug = chalk.blue;

type Args = any;

const originalLog = console.log; // https://developer.mozilla.org/en-US/docs/Web/API/console // https://stackoverflow.com/a/16259739/
console.log = function (...args: Args) {
  Reflect.apply(originalLog, this, [getFormattedUtcDatetimeNow(), ...args]);
};

const originalInfo = console.info;
console.info = function (...args: Args) {
  Reflect.apply(originalInfo, this, [getFormattedUtcDatetimeNow(), info(...args)]);
};

const originalDebug = console.debug;
console.debug = function (...args: Args) {
  Reflect.apply(originalDebug, this, [getFormattedUtcDatetimeNow(), debug(...args)]);
};

const originalWarn = console.warn;
console.warn = function (...args: Args) {
  Reflect.apply(originalWarn, this, [getFormattedUtcDatetimeNow(), warn(...args)]);
};

const originalError = console.error;
console.error = function (...args: Args) {
  Reflect.apply(originalError, this, [getFormattedUtcDatetimeNow(), error(...args)]);
};

/**
 * NOTE: Currently, importing this function is the only way that console.log, console.warn, and other functions get overwritten above.
 *
 * @param args
 */
export function logSuccess(...args: Args) {
  console.log(success(...args));
}
