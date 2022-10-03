import type React from 'react';

export type AccountId = string;

export type AccountStatus = {
  accountId: AccountId;
  lastUpdate: string;
  status: string;
};

// --------------------------------------------------------
// Does this section contain duplicate code? I.e. Are these types already defined elsewhere, such as in Mongoose models? https://stackoverflow.com/a/61154023/

type Decimal128 = any; // How can we handle this?

export type TxActionRow = {
  // See server/src/models/TxActions.js and https://mongoosejs.com/docs/typescript.html
  accountId: string;
  amount_transferred?: string;
  amount_transferred2?: string;
  args_base64?: string;
  block_height?: number | null;
  block_timestamp?: Decimal128;
  block_timestamp_utc?: string;
  cliff_duration?: string;
  currency_transferred?: string;
  currency_transferred2?: string;
  from_account?: string;
  get_currency_by_contract?: string;
  lockup_duration?: string;
  lockup_start?: string;
  pool_id?: string;
  receiver_lockup_account?: string;
  receiver_owner_account?: string;
  release_duration?: string;
  transaction_hash?: string;
  txType: string;
};

export type TxTypeRow = {
  name: string;
  sql: string;
};

export type TxActionsFilter = {
  accountId: AccountId;
  block_timestamp: {
    $gte: number;
    $lte: number;
  };
  txType?: string[];
};
// --------------------------------------------------------

// export type CustomWindow = Window & {
//   // See https://stackoverflow.com/a/45352250/ and https://bobbyhadz.com/blog/typescript-property-does-not-exist-on-type-window
//   accountId: AccountId;
//   contract: any;
//   nearInitPromise: any;
//   walletConnection: any;
// };

export type OptionType = { label: string; value: string }; // https://github.com/JedWatson/react-select/issues/2902#issuecomment-624806537

// TODO: Throughout this repo, clean up the use of `any`.

export type AccountRowProps = {
  accountId: any;
  accountStatus: any;
  addAccountCsv: any;
  deleteFromLocalStorage: any;
  getTransactions: any;
  runTask: any;
  selectedAccountId: any;
  selectedAccountIdsForCsv: any;
};

export type AccountsTableProps = {
  accountIds: any;
  accountStatuses: any;
  addNewAccount: (event: React.FormEvent<HTMLFormElement>) => void;
  csvTransactions: any;
  endDate: any;
  exampleAccount: any;
  getTransactions: any;
  handleNewAccountIdInputChange: (event: React.FormEvent<HTMLInputElement>) => void;
  messageCsv: any;
  newAccountId: any;
  runTask: any;
  selectedAccountId: any;
  selectedAccountIdsForCsv: any;
  setAccountIds: any;
  setSelectedAccountIdsForCsv: any;
  startDate: any;
};

export type CsvTransaction = any;
