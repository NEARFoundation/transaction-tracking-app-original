import MultiSelect from 'react-select'; // https://react-select.com/home

import { OptionType } from '../../../shared/types';

// eslint-disable-next-line max-lines-per-function
export function FormattingControls({ divisorPowerOptions, divisorPower, onChangeDivisorPower, decimalPlacesOptions, decimalPlaces, onChangeDecimalPlaces }): JSX.Element {
  return (
    <>
      <span style={{ paddingRight: '1rem' }}>
        Divide by:{' '}
        <MultiSelect
          options={divisorPowerOptions}
          placeholder="Divide by"
          defaultValue={divisorPowerOptions.find((option: OptionType) => option.value === divisorPower)}
          className="my-react-select-container divisorPower"
          onChange={onChangeDivisorPower}
        />
      </span>
      <span>
        Decimal places:{' '}
        <MultiSelect
          options={decimalPlacesOptions}
          placeholder="Decimal places"
          defaultValue={decimalPlacesOptions.find((option: OptionType) => option.value === decimalPlaces)}
          className="my-react-select-container decimalPlaces"
          onChange={onChangeDecimalPlaces}
        />
      </span>
    </>
  );
}
