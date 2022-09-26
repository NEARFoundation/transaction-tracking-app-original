export type AccountId = string;

export type AccountStatus = {
  accountId: AccountId;
  lastUpdate: string;
  status: string;
};

export type TxActionsFilter = {
  accountId: AccountId;
  block_timestamp: {
    $gte: number;
    $lte: number;
  };
  txType?: string[];
};

declare global {
  interface Window {
    // https://bobbyhadz.com/blog/typescript-property-does-not-exist-on-type-window
    accountId: AccountId;
    contract: any;
    nearInitPromise: any;
    walletConnection: any;
  }
}
