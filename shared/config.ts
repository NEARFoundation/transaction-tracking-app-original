/* eslint-disable canonical/filename-match-exported */
const contractName = process.env.CONTRACT_NAME ?? 'near-transactions-accounting-report';
const localHome = process.env.HOME;
const CHAIN = process.env.REACT_APP_CHAIN ?? process.env.CHAIN ?? 'mainnet';

// eslint-disable-next-line max-lines-per-function
const getConfig = () => {
  console.log('shared/config.js getConfig', { CHAIN });
  switch (CHAIN) {
    case 'production':
    case 'test': // The reason for putting 'test' here, causing mainnet to be used is that tests like getCurrencyByContract depend on real world data. What are the risks, though?
    case 'mainnet':
      return {
        contractName,
        exampleAccount: 'example.near',
        explorerUrl: 'https://explorer.mainnet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org', // TODO: If this URL isn't the wallet selector, we might need to update it soon.
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
      throw new Error(`Unconfigured CHAIN '${CHAIN}'. Can be configured in shared/config.js.`);
  }
};

export default getConfig;
