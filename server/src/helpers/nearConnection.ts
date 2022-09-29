import nearApi from 'near-api-js';
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores/in_memory_key_store.js';
import { type KeyStore } from 'near-api-js/lib/key_stores/keystore.js';

export function getNearApiConnection(nodeUrl: string, keyStore?: KeyStore) {
  console.log('getNearApiConnection', { nodeUrl, keyStore, nearApi });
  const connectionInfo = { url: nodeUrl };
  const provider = new nearApi.providers.JsonRpcProvider(connectionInfo);
  const signer = new nearApi.InMemorySigner(keyStore ?? new InMemoryKeyStore());
  const connection = new nearApi.Connection(nodeUrl, provider, signer);
  return connection;
}