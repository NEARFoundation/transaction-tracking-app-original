import { getFormattedDatetimeUtcFromBlockTimestamp } from '../helpers/datetime';

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
        {transactions.map((item, index) => (
          <tr key={index}>
            <td>{item.accountId}</td>
            <td>{item.txType}</td>
            <td>{item.block_timestamp}</td>
            <td>{getFormattedDatetimeUtcFromBlockTimestamp(item.block_timestamp)}</td>
            <td>{item.from_account}</td>
            <td>{item.block_height}</td>
            <td>{item.args_base64}</td>
            <td>
              <a href={`${explorerUrl}/transactions/${item.transaction_hash}`}>{item.transaction_hash}</a>
            </td>
            <td>{item.amount_transferred}</td>
            <td>{item.currency_transferred}</td>
            <td>{item.amount_transferred2}</td>
            <td>{item.currency_transferred2}</td>
            <td>{item.receiver_owner_account}</td>
            <td>{item.receiver_lockup_account}</td>
            <td>{item.lockup_start}</td>
            <td>{item.lockup_duration}</td>
            <td>{item.cliff_duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};