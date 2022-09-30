export type AccountId = string;

export type AccountStatus = {
  accountId: AccountId;
  lastUpdate: string;
  status: string;
};

// --------------------------------------------------------
// Does this section contain duplicate code? I.e. Are these types already defined elsewhere, such as in Mongoose models? https://stackoverflow.com/a/61154023/

export type TxActionRow = {
  // See server/src/models/TxActions.js and https://mongoosejs.com/docs/typescript.html
  accountId: string;
  txType: string;
  block_timestamp?: any; // Decimal128
  block_timestamp_utc?: string;
  from_account?: string;
  block_height?: number;
  args_base64?: string;
  transaction_hash?: string;
  amount_transferred?: string;
  currency_transferred?: string;
  amount_transferred2?: string;
  currency_transferred2?: string;
  receiver_owner_account?: string;
  receiver_lockup_account?: string;
  lockup_start?: string;
  lockup_duration?: string;
  cliff_duration?: string;
  get_currency_by_contract?: string;
  pool_id?: string;
};

export type TxTypeRow = {
  sql: string;
  name: string;
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

declare global {
  interface Window {
    // https://bobbyhadz.com/blog/typescript-property-does-not-exist-on-type-window
    accountId: AccountId;
    contract: any;
    nearInitPromise: any;
    walletConnection: any;
  }
}

export type OptionType = { label: string; value: string }; // https://github.com/JedWatson/react-select/issues/2902#issuecomment-624806537
