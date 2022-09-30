/* eslint-disable canonical/filename-match-exported */
const contractName = process.env.CONTRACT_NAME ?? 'near-transactions-accounting-report';
const localHome = process.env.HOME;

// eslint-disable-next-line max-lines-per-function
const getConfig = (environment: string = 'development') => {
  console.log('shared/config.js getConfig', { environment });
  switch (environment) {
    case 'production':
    case 'mainnet':
      return {
        contractName,
        exampleAccount: 'example.near',
        explorerUrl: 'https://explorer.mainnet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
      };
    case 'development':
    case 'testnet':
      return {
        contractName,
        exampleAccount: 'example.testnet',
        explorerUrl: 'https://explorer.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
      };
    case 'betanet':
      return {
        contractName,
        explorerUrl: 'https://explorer.betanet.near.org',
        helperUrl: 'https://helper.betanet.near.org',
        networkId: 'betanet',
        nodeUrl: 'https://rpc.betanet.near.org',
        walletUrl: 'https://wallet.betanet.near.org',
      };
    case 'local':
      return {
        contractName,
        keyPath: `${localHome}/.near/validator_key.json`,
        networkId: 'local',
        nodeUrl: 'http://localhost:3030',
        walletUrl: 'http://localhost:4000/wallet',
      };
    case 'test':
    case 'ci':
      return {
        contractName,
        masterAccount: 'test.near',
        networkId: 'shared-test',
        nodeUrl: 'https://rpc.ci-testnet.near.org',
      };
    case 'ci-betanet':
      return {
        contractName,
        masterAccount: 'test.near',
        networkId: 'shared-test-staging',
        nodeUrl: 'https://rpc.ci-betanet.near.org',
      };
    default:
      throw new Error(`Unconfigured environment '${environment}'. Can be configured in shared/config.js.`);
  }
};

export default getConfig;
