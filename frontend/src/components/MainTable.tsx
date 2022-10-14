/* eslint-disable max-lines-per-function */
import { getFormattedDatetimeUtcFromBlockTimestamp } from '../../../shared/helpers/datetime';
import { round } from '../../../shared/helpers/precision';

export const MainTable = ({ transactions, explorerUrl, divisorPower, decimalPlaces, isLoading }) => {
  const readableAmountHeader = divisorPower ? `amount_transferred_divided_by_1e${divisorPower.toString()}` : `amount_transferred_readable`;
  return (
    <table className={isLoading ? 'blur' : ''}>
      <thead>
        <tr>
          <th>accountId</th>
          <th>txType</th>
          <th>block_timestamp_utc</th>
          <th>transaction_hash</th>
          <th>from_account</th>
          {/* Some currencies won't be NEAR so this label should specify the divisor instead. */}
          <th>{readableAmountHeader}</th>
          <th>currency_transferred</th>
          <th>args_base64</th>
          <th>amount_transferred</th>
          <th>amount_transferred2</th>
          <th>currency_transferred2</th>
          <th>receiver_owner_account</th>
          <th>receiver_lockup_account</th>
          <th>lockup_start</th>
          <th>lockup_duration</th>
          <th>cliff_duration</th>
          <th>block_timestamp</th>
          <th>block_height</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction, index: number) => {
          // console.log({ transaction });
          return (
            <tr key={index}>
              <td>{transaction.accountId}</td>
              <td>{transaction.txType}</td>
              <td className="fixed-width">{getFormattedDatetimeUtcFromBlockTimestamp(transaction.block_timestamp)}</td>
              <td className="max-width-none">
                <a href={`${explorerUrl}/transactions/${transaction.transaction_hash}`} className="fixed-width">
                  {transaction.transaction_hash}
                </a>
              </td>
              <td>{transaction.from_account}</td>
              {/* https://github.com/near/units-js/blob/d0e76d5729b0f3b58b98263a1f92fb057eb84d96/src/near.ts#L20 
              and https://github.com/near/units-js/blob/d0e76d5729b0f3b58b98263a1f92fb057eb84d96/__tests__/near.spec.ts#L4*/}
              <td className="fixed-width max-width-none" style={{ textAlign: 'right' }}>
                {round(transaction.amount_transferred, decimalPlaces, divisorPower)}
              </td>
              <td>{transaction.currency_transferred}</td>
              <td>{transaction.args_base64}</td>
              <td>{transaction.amount_transferred}</td>
              <td>{transaction.amount_transferred2}</td>
              <td>{transaction.currency_transferred2}</td>
              <td>{transaction.receiver_owner_account}</td>
              <td>{transaction.receiver_lockup_account}</td>
              <td>{transaction.lockup_start}</td>
              <td>{transaction.lockup_duration}</td>
              <td>{transaction.cliff_duration}</td>
              <td>{transaction.block_timestamp}</td>
              <td>{transaction.block_height}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
