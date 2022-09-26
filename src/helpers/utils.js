import { connect, Contract, keyStores, WalletConnection } from 'near-api-js';

import getConfig from '../../shared/config.js';

const REACT_APP_ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || 'development';
console.log('src/utils.js', { REACT_APP_ENVIRONMENT });
const nearConfig = getConfig(REACT_APP_ENVIRONMENT);

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() }, ...nearConfig });

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near);

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ['set_greeting'],

    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ['get_greeting'],
  });
}

export function logout() {
  window.walletConnection.signOut();
  // reload page
  window.location.replace(window.location.origin + window.location.pathname);
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName);
}
