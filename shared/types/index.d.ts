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
