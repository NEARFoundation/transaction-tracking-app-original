// This file is unfortunately mostly duplicated with `src/config.js` because of https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory

// eslint-disable-next-line canonical/filename-match-exported
const contractName = process.env.CONTRACT_NAME || 'near-transactions-accounting-report';
const localHome = process.env.HOME;

export default function getConfig(environment) {
  switch (environment) {
    case 'production':
    case 'mainnet':
      return {
        contractName,
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
      throw new Error(`Unconfigured environment '${environment}'. Can be configured in server/src/config.js.`);
  }
}
