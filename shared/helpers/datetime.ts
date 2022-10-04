import dayjs from 'dayjs';
// eslint-disable-next-line import/extensions
import utc from 'dayjs/plugin/utc.js';
// https://day.js.org/docs/en/plugin/utc
dayjs.extend(utc);

/**
 *
 * @param {Date} date
 * @returns {string} like 2022-08-03 17:32:00 UTC
 */
export const getFormattedUtcDatetime = (date: Date): string => {
  return dayjs(date).utc().format('YYYY-MM-DD HH:mm:ss [UTC]'); // https://day.js.org/docs/en/manipulate/utc
};

export const getFormattedUtcDatetimeForFilename = (date: Date): string => {
  const formattedUtcDatetime = getFormattedUtcDatetime(date);
  return formattedUtcDatetime.replaceAll(' ', '_').replaceAll(':', '');
};

export const getCsvFilename = (accountIds: string[], startDate: Date, endDate: Date) => {
  const prefix = accountIds.length ? `${accountIds.join('_')}_` : ``;
  const filename = `${prefix}${getFormattedUtcDatetimeForFilename(startDate)}_to_${getFormattedUtcDatetimeForFilename(endDate)}_at_${getFormattedUtcDatetimeForFilename(
    new Date(),
  )}.csv`;
  console.log({ filename });
  return filename;
};

export const getDefaultStartUtc = (): Date => {
  const start = new Date(Date.UTC(2_020, 9, 1, 0, 0, 0));
  return new Date(start);
};

export const getEndOfTodayUtc = (): Date => {
  const moment = new Date();
  moment.setUTCHours(23, 59, 59, 999);
  moment.setDate(moment.getDate() + 1);
  return new Date(moment);
};

/**
 *
 * @param {number} block_timestamp in nanoseconds (billionths of a second), such as 1659547920000000000
 * @returns {string} like 2022-08-03 17:32:00
 */
export const getFormattedDatetimeUtcFromBlockTimestamp = (block_timestamp: number): string => {
  const timestampInMilliseconds = block_timestamp / 1_000_000;
  return getFormattedUtcDatetime(new Date(timestampInMilliseconds)).replace(/ UTC$/u, '');
};

export const getRangeFilter = (startDate: number, endDate: number) => {
  return {
    $gte: Math.floor(new Date(startDate).getTime()) * 1_000_000,
    $lte: Math.floor(new Date(endDate).getTime()) * 1_000_000,
  };
};

export function millisToMinutesAndSeconds(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60_000);
  const seconds = ((milliseconds % 60_000) / 1_000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
}

// TODO: Clean up these functions.
/* eslint-disable no-param-reassign */
export function convertUTCToLocalDate(date: any) {
  if (!date) {
    return date;
  }

  date = new Date(date);
  date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return date;
}

export function convertLocalToUTCDate(date: any) {
  if (!date) {
    return date;
  }

  date = new Date(date);
  date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return date;
}
/* eslint-enable no-param-reassign */
