import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
// https://day.js.org/docs/en/plugin/utc
dayjs.extend(utc);

export const getFormattedUtcDatetime = (date: Date): string => {
  return dayjs(date).utc().format('YYYY-MM-DD HH:mm:ss [UTC]'); // https://day.js.org/docs/en/manipulate/utc
};

export const getFormattedUtcDatetimeForFilename = (date: Date): string => {
  const formattedUtcDatetime = getFormattedUtcDatetime(date);
  return formattedUtcDatetime.replaceAll(' ', '_').replaceAll(':', '');
};

export const getCsvFilename = (startDate: Date, endDate: Date) => {
  return `transactions_${getFormattedUtcDatetimeForFilename(startDate)}_to_${getFormattedUtcDatetimeForFilename(endDate)}.csv`;
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

export const getFormattedDateFromBlockTimestamp = (block_timestamp: any): string => {
  // TODO: Specify the type for block_timestamp, document what block_timestamp is, and improve the output formatting.
  return new Date(block_timestamp / 1_000_000).toLocaleString();
};
