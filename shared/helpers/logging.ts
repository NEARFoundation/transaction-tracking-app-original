import winston from 'winston';
import { type AbstractConfigSetLevels } from 'winston/lib/winston/config/index.js';

const simpleConsoleLogging = winston.format.combine( // Simple console logging for local environment.
  winston.format.timestamp(),
  winston.format.simple(),
  winston.format.printf(message =>
    winston.format.colorize().colorize(message.level, `${message.timestamp} ${message.level}: ${message.message}`) // https://github.com/winstonjs/winston/issues/1388#issuecomment-432932959
  )
);
const transports: any[] = [];
// TODO: Add different transports based on environment variables.
// if (process.env.ENABLE_CONSOLE_LOGGER === 'true') {
  transports.push(new winston.transports.Console({ format: simpleConsoleLogging }))
// }

const myCustomLevels: { colors: { [key: string]: string }, levels: AbstractConfigSetLevels } = { 
  levels: { // These are the defaults. https://github.com/winstonjs/winston#logging-levels
    error: 0,
    warn: 1,
    info: 2,
    // http: 3,
    success: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  },
  colors: { // https://github.com/winstonjs/winston#using-custom-logging-levels
    error: 'redBG',
    warn: 'yellow',
    info: 'blue',
    debug: 'magenta',
    silly: 'gray',
    success: 'greenBG'
  }
};

export const logger:any = winston.createLogger({
  levels: myCustomLevels.levels,
  format: simpleConsoleLogging,
  // defaultMeta: { service: 'user-service' },
  transports,
});

winston.addColors(myCustomLevels.colors); // https://github.com/winstonjs/winston#using-custom-logging-levels
