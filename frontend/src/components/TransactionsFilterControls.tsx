import MultiSelect from 'react-select'; // https://react-select.com/home

import { AccountId, OptionType } from '../../../shared/types';

import { DatePickerUtc } from './DatePickerUtc';

const MultiSelectStyles = {
  option: (base: any) => ({
    ...base,
    color: '#444',
  }),
  valueContainer: (base: any) => ({
    ...base,
    maxHeight: 500,
    overflowY: 'auto',
  }),
};

type Props = {
  accountIds: AccountId[];
  startDate: Date;
  setStartDate: any;
  endDate: Date;
  setEndDate: any;
  types: OptionType[];
  selectedTypes: OptionType[];
  onChangeTypes: (value: any, event: any) => void;
};

// eslint-disable-next-line max-lines-per-function
export function TransactionsFilterControls({ accountIds, startDate, setStartDate, endDate, setEndDate, types, selectedTypes, onChangeTypes }: Props): JSX.Element {
  // If you experience weirdness when switching between certain commits, try deleting startDate and endDate from your localStorage.
  const datePickerProps = {
    showMonthDropdown: true,
    showYearDropdown: true,
    dateFormat: 'yyyy-MM-dd',
    isEndOfDay: false,
  };
  const datePickerPropsEndOfDay = {
    ...datePickerProps,
    isEndOfDay: true,
  };
  if (accountIds.length > 0) {
    return (
      <>
        <div style={{ paddingBottom: '6px', textAlign: 'center' }}>
          From: <DatePickerUtc selected={startDate} onChange={(utcDate: Date) => setStartDate(utcDate)} {...datePickerProps} />
          To: <DatePickerUtc selected={endDate} onChange={(utcDate: Date) => setEndDate(utcDate)} {...datePickerPropsEndOfDay} />
        </div>

        <MultiSelect
          options={[{ label: '--- Select All ---', value: '*' }, ...types]}
          placeholder="Select transaction types"
          value={selectedTypes}
          className="my-react-select-container"
          onChange={onChangeTypes}
          isMulti
          styles={MultiSelectStyles}
        />
      </>
    );
  } else {
    return <></>;
  }
}
