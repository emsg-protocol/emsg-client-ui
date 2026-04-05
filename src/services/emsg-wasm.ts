// src/services/emsg-wasm.ts
// JS bridge for EMSG Client SDK WASM
// Requires emsg.wasm and wasm_exec.js in public/ (bootstrapped by index.html)

function waitForWasm(): Promise<void> {
  return new Promise((resolve, reject) => {
    const maxAttempts = 50; // 50 × 100ms = 5 seconds
    let attempts = 0;

    function poll() {
      if ((window as any).__emsgWasmError) {
        return reject(new Error((window as any).__emsgWasmError));
      }
      if ((window as any).__emsgWasmReady) {
        return resolve();
      }
      attempts++;
      if (attempts >= maxAttempts) {
        return reject(new Error('Daemon not reachable'));
      }
      setTimeout(poll, 100);
    }

    poll();
  });
}

export async function emsg_generateKeyPair(): Promise<{ privateKey: string; publicKey: string; error?: string }> {
  await waitForWasm();
  return (window as any).emsg_generateKeyPair();
}

export async function emsg_importPrivateKey(privHex: string): Promise<{ privateKey: string; publicKey: string; error?: string }> {
  await waitForWasm();
  return (window as any).emsg_importPrivateKey(privHex);
}

export async function emsg_initClient(privHex: string): Promise<boolean | { error: string }> {
  await waitForWasm();
  return (window as any).emsg_initClient(privHex);
}

export async function emsg_sendMessage(from: string, to: string, body: string): Promise<{ success?: boolean; error?: string }> {
  await waitForWasm();
  return (window as any).emsg_sendMessage(from, to, body);
}

export async function emsg_getMessages(user: string): Promise<any> {
  await waitForWasm();
  return (window as any).emsg_getMessages(user);
}

export async function emsg_registerUser(
  address: string,
  pubKeyBase64: string,
  authMode: 'password' | 'key',
  encryptedPrivateKey?: string,
  salt?: string,
  iv?: string
): Promise<{ error?: string }> {
  await waitForWasm();
  return (window as any).emsg_registerUser(address, pubKeyBase64, authMode, encryptedPrivateKey, salt, iv);
}

export async function emsg_updateEncryptedKey(
  address: string,
  authMode: 'password' | 'key',
  encryptedPrivateKey?: string,
  salt?: string,
  iv?: string
): Promise<{ error?: string }> {
  await waitForWasm();
  return (window as any).emsg_updateEncryptedKey(address, authMode, encryptedPrivateKey, salt, iv);
}

export async function emsg_getAuthInfo(
  address: string
): Promise<{ auth_mode: string; encrypted_private_key?: string; salt?: string; iv?: string; error?: string }> {
  await waitForWasm();
  return (window as any).emsg_getAuthInfo(address);
}

// Usage example (in a React component):
// import { emsg_generateKeyPair, emsg_sendMessage } from '../services/emsg-wasm';
// const keys = await emsg_generateKeyPair();
// await emsg_sendMessage('alice#example.com', 'bob#test.org', 'Hello!');
