// TODO: Move to shared location to eliminate duplication with `src/helpers/datetime.ts`.

import dayjs from 'dayjs';
// eslint-disable-next-line import/extensions
import utc from 'dayjs/plugin/utc.js';
// https://day.js.org/docs/en/plugin/utc
dayjs.extend(utc);

export const getFormattedUtcDatetime = (date: Date): string => {
  return dayjs(date).utc().format('YYYY-MM-DD HH:mm:ss [UTC]'); // https://day.js.org/docs/en/manipulate/utc
};

export const getFormattedUtcDatetimeForFilename = (date: Date): string => {
  const formattedUtcDatetime = getFormattedUtcDatetime(date);
  return formattedUtcDatetime.replaceAll(' ', '_').replaceAll(':', '');
};

export const getCsvFilename = (accountIds: string[], startDate: Date, endDate: Date) => {
  const prefix = accountIds.length ? `${accountIds.join('_')}_` : ``;
  const filename = `${prefix}${getFormattedUtcDatetimeForFilename(startDate)}_to_${getFormattedUtcDatetimeForFilename(endDate)}.csv`;
  console.log({ filename });
  return filename;
};

export const getBeginningOfTodayUtc = (): Date => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return new Date(today);
};

export const getEndOfTodayUtc = (): Date => {
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);
  return new Date(today);
};

/**
 *
 * @param block_timestamp in nanoseconds (billionths of a second), such as 1659547920000000000
 * @returns {string} like 2022-08-03 17:32:00 UTC
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
