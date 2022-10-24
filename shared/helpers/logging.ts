import { type TransformableInfo, type ColorizeOptions } from 'logform';
import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import type * as Transport from 'winston-transport';
import { type AbstractConfigSetLevels } from 'winston/lib/winston/config/index.js';

import { cloudwatchConfig, LOG_TO_CLOUDWATCH, LOG_TO_CONSOLE } from '../config.js';

const myCustomLevels: { colors: { [key: string]: string }; levels: AbstractConfigSetLevels } = {
  levels: {
    // These are the defaults: https://github.com/winstonjs/winston#logging-levels
    error: 0,
    warn: 1,
    info: 2,
    // http: 3,
    success: 3, // 'success' is a custom level replacing 'http'.
    verbose: 4,
    debug: 5,
    silly: 6,
  },
  colors: {
    // https://github.com/winstonjs/winston#using-custom-logging-levels
    error: 'redBG',
    warn: 'yellow',
    info: 'blue',
    debug: 'magenta',
    silly: 'gray',
    success: 'greenBG',
  },
};

const colorizerOptions: ColorizeOptions = { level: true, message: false };
const colorizer = winston.format.colorize(colorizerOptions);

const simpleConsoleLogging = winston.format.combine(
  // Simple console logging for local environment.
  winston.format.timestamp(),
  winston.format.printf((info: TransformableInfo) => {
    const { level, message, timestamp, ...rest } = info;
    const coloredTimestampAndLevel = colorizer.colorize(level, `${timestamp} ${level}:`);
    const syntaxHighlightedObjects = Object.keys(rest).length > 0 ? JSON.stringify(rest) : ''; // TODO: How can we reenable the syntax coloring that console.log had by default? https://stackoverflow.com/questions/74186705/how-to-preserve-default-syntax-highlighting-colors-in-javascript-console
    return `${coloredTimestampAndLevel} ${message} ${syntaxHighlightedObjects}`; // https://github.com/winstonjs/winston/issues/1388#issuecomment-432932959
  }),
);

function getMaxLevelName(levels: AbstractConfigSetLevels): string {
  let maxLevel = 0;
  let maxLevelName = '';
  for (const level of Object.keys(levels)) {
    if (levels[level] > maxLevel) {
      maxLevel = levels[level];
      maxLevelName = level;
    }
  }

  return maxLevelName;
}

const transports: Transport[] = [];
if (LOG_TO_CONSOLE === 'true') {
  transports.push(new winston.transports.Console({ format: simpleConsoleLogging, level: getMaxLevelName(myCustomLevels.levels) }));
}

export const logger = winston.createLogger({
  levels: myCustomLevels.levels,
  format: simpleConsoleLogging,
  // defaultMeta: { service: 'user-service' },
  transports,
}) as Record<keyof typeof myCustomLevels.levels, winston.LeveledLogMethod> & winston.Logger; // https://stackoverflow.com/a/53298622/

winston.addColors(myCustomLevels.colors); // https://github.com/winstonjs/winston#using-custom-logging-levels

if (LOG_TO_CLOUDWATCH === 'true') {
  logger.add(new WinstonCloudWatch(cloudwatchConfig));
}
