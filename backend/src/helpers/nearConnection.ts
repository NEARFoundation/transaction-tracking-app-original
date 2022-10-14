import * as nearAPI from 'near-api-js'; // https://docs.near.org/tools/near-api-js/quick-reference#import
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores/in_memory_key_store.js';
import { type KeyStore } from 'near-api-js/lib/key_stores/keystore.js';

export function getNearApiConnection(nodeUrl: string, keyStore?: KeyStore) {
  const connectionInfo = { url: nodeUrl };
  const provider = new nearAPI.providers.JsonRpcProvider(connectionInfo);
  const signer = new nearAPI.InMemorySigner(keyStore ?? new InMemoryKeyStore());
  const connection = new nearAPI.Connection(nodeUrl, provider, signer);
  // console.log('getNearApiConnection', connection);
  return connection;
}
