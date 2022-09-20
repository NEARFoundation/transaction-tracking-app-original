import { getFormattedDatetimeUtcFromBlockTimestamp } from '../../shared/helpers/datetime';

export const MainTable = ({ transactions, explorerUrl }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>accountId</th>
          <th>txType</th>
          <th>block_timestamp</th>
          <th>block_timestamp_utc</th>
          <th>from_account</th>
          <th>block_height</th>
          <th>args_base64</th>
          <th>transaction_hash</th>
          <th>amount_transferred</th>
          <th>currency_transferred</th>
          <th>amount_transferred2</th>
          <th>currency_transferred2</th>
          <th>receiver_owner_account</th>
          <th>receiver_lockup_account</th>
          <th>lockup_start</th>
          <th>lockup_duration</th>
          <th>cliff_duration</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction, index) => {
          // console.log({ transaction });
          return (
            <tr key={index}>
              <td>{transaction.accountId}</td>
              <td>{transaction.txType}</td>
              <td>{transaction.block_timestamp}</td>
              <td>{getFormattedDatetimeUtcFromBlockTimestamp(transaction.block_timestamp)}</td>
              <td>{transaction.from_account}</td>
              <td>{transaction.block_height}</td>
              <td>{transaction.args_base64}</td>
              <td>
                <a href={`${explorerUrl}/transactions/${transaction.transaction_hash}`}>{transaction.transaction_hash}</a>
              </td>
              <td>{transaction.amount_transferred}</td>
              <td>{transaction.currency_transferred}</td>
              <td>{transaction.amount_transferred2}</td>
              <td>{transaction.currency_transferred2}</td>
              <td>{transaction.receiver_owner_account}</td>
              <td>{transaction.receiver_lockup_account}</td>
              <td>{transaction.lockup_start}</td>
              <td>{transaction.lockup_duration}</td>
              <td>{transaction.cliff_duration}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
