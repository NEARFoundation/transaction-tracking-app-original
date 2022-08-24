import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // https://day.js.org/docs/en/plugin/utc
dayjs.extend(utc);

export function getFormattedUtcDatetime(date: Date): string {
    return dayjs(date).utc().format('YYYY-MM-DD HH:mm:ss [UTC]'); // https://day.js.org/docs/en/manipulate/utc
}

export function getFormattedUtcDatetimeForFilename(date: Date): string { 
    const formattedUtcDatetime = getFormattedUtcDatetime(date);
    return formattedUtcDatetime.replaceAll(' ', '_').replaceAll(':', '');
}

export function getFilename(startDate: Date, endDate: Date) {
    return `transactions_${getFormattedUtcDatetimeForFilename(startDate)}_to_${getFormattedUtcDatetimeForFilename(endDate)}.csv`;
}