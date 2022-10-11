import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MultiSelect from 'react-select'; // https://react-select.com/home

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

export function TransactionsFilterControls({ accountIds, startDate, setStartDate, endDate, setEndDate, types, selectedTypes, onChangeTypes }): JSX.Element {
  if (accountIds.length > 0) {
    return (
      <>
        <div style={{ paddingBottom: '6px', textAlign: 'center' }}>
          From: <DatePicker selected={startDate} onChange={(date: any) => setStartDate(date)} showMonthDropdown showYearDropdown dateFormat="yyyy-MM-dd" />
          To: <DatePicker selected={endDate} onChange={(date: any) => setEndDate(date)} showMonthDropdown showYearDropdown dateFormat="yyyy-MM-dd" />
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
