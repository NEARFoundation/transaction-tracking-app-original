// https://stackoverflow.com/q/53052012/

import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import { getEndOfDayUtc, treatLocalDateAsUtcMidnight, treatUtcMidnightAsLocalDate } from '../../../shared/helpers/datetime';

type DatePickerUtcProps = {
  selected: Date | string;
  onChange: any;
  isEndOfDay: boolean;
};

function getSelectedAsLocal(selected: Date | string): Date {
  const selectedDate = typeof selected === 'string' ? new Date(selected) : selected;

  return treatUtcMidnightAsLocalDate(selectedDate);
}

export function DatePickerUtc({ selected, onChange, isEndOfDay, ...datePickerProps }: DatePickerUtcProps): JSX.Element {
  function onChangeAsUtc(local: Date) {
    const utc = treatLocalDateAsUtcMidnight(local);
    const adjusted = isEndOfDay ? getEndOfDayUtc(utc) : utc;
    console.log('onChangeAsUtc', { local, utc, adjusted, isEndOfDay });
    onChange(adjusted);
  }

  return <DatePicker onChange={onChangeAsUtc} selected={getSelectedAsLocal(selected)} {...datePickerProps} />;
}
