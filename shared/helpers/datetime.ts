import dayjs from 'dayjs';
// eslint-disable-next-line import/extensions
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
// eslint-disable-next-line import/order
import timezone from 'dayjs/plugin/timezone.js'; // dependent on utc plugin https://day.js.org/docs/en/plugin/timezone

dayjs.extend(utc); // https://day.js.org/docs/en/plugin/utc
dayjs.extend(relativeTime); // https://day.js.org/docs/en/plugin/relative-time
dayjs.extend(timezone);

/**
 *
 * @param {Date} date
 * @returns {string} like 2022-08-03 17:32:00 UTC
 */
export const getFormattedUtcDatetime = (date: Date): string => {
  return dayjs(date).utc().format('YYYY-MM-DD HH:mm:ss [UTC]'); // https://day.js.org/docs/en/manipulate/utc
};

export function getFormattedUtcDatetimeNow(): string {
  return getFormattedUtcDatetime(new Date());
}

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

export function getStartOfDayUtc(date: Date): Date {
  // console.log('getStartOfDayUtc', date);
  return dayjs.utc(date).startOf('day').toDate(); // https://day.js.org/docs/en/manipulate/start-of
}

export function getEndOfDayUtc(date: Date): Date {
  // console.log('getEndOfDayUtc', date);
  return dayjs.utc(date).endOf('day').toDate(); // https://day.js.org/docs/en/manipulate/end-of
}

export const getDefaultStartUtc = (): Date => {
  const start = new Date(Date.UTC(2_020, 9, 1, 0, 0, 0));
  return new Date(start);
};

export const getEndOfTodayUtc = (): Date => {
  const moment = new Date();
  return getEndOfDayUtc(moment);
};

export function treatLocalDateAsUtcMidnight(localDate: Date): Date {
  const moment = dayjs(localDate).tz('UTC', true); // https://day.js.org/docs/en/plugin/timezone
  const utcMidnight = getStartOfDayUtc(moment.toDate());
  console.log({ localDate, utcMidnight });
  return utcMidnight;
}

export function treatUtcMidnightAsLocalDate(utcMidnight: Date): Date {
  const sliceOfJustTheDatePart = utcMidnight.toISOString().slice(0, 10);
  const localDate = dayjs(sliceOfJustTheDatePart).toDate();

  console.log({ localDate, sliceOfJustTheDatePart, utcMidnight });
  return localDate;
}

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

// ---------------------------------------
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
// ---------------------------------------

export function getRelativeTimeOrUtc(date: string): string {
  if (date === '') {
    return '';
  } else {
    const defaultMomentString = getFormattedUtcDatetime(new Date(date));
    const defaultMoment = dayjs(defaultMomentString);
    if (dayjs().subtract(1, 'week').isBefore(defaultMoment)) {
      return dayjs().to(defaultMoment); // relative time, such as "2 days ago" https://day.js.org/docs/en/plugin/relative-time
    } else {
      return defaultMomentString;
    }
  }
}
