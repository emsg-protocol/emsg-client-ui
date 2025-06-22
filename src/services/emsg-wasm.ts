// src/services/emsg-wasm.ts
// JS bridge for EMSG Client SDK WASM
// Requires emsg.wasm and wasm_exec.js in public/

let wasmReady: Promise<void> | null = null;

function loadWasm(): Promise<void> {
  if (wasmReady) return wasmReady;
  wasmReady = new Promise((resolve, reject) => {
    const go = new (window as any).Go();
    WebAssembly.instantiateStreaming(fetch('/emsg.wasm'), go.importObject)
      .then((result) => {
        go.run(result.instance);
        resolve();
      })
      .catch(reject);
  });
  return wasmReady;
}

export async function emsg_generateKeyPair(): Promise<{ privateKey: string; publicKey: string; error?: string }> {
  await loadWasm();
  return (window as any).emsg_generateKeyPair();
}

export async function emsg_importPrivateKey(privHex: string): Promise<{ privateKey: string; publicKey: string; error?: string }> {
  await loadWasm();
  return (window as any).emsg_importPrivateKey(privHex);
}

export async function emsg_initClient(privHex: string): Promise<boolean | { error: string }> {
  await loadWasm();
  return (window as any).emsg_initClient(privHex);
}

export async function emsg_sendMessage(from: string, to: string, body: string): Promise<{ success?: boolean; error?: string }> {
  await loadWasm();
  return (window as any).emsg_sendMessage(from, to, body);
}

export async function emsg_getMessages(user: string): Promise<any> {
  await loadWasm();
  return (window as any).emsg_getMessages(user);
}

// Usage example (in a React component):
// import { emsg_generateKeyPair, emsg_sendMessage } from '../services/emsg-wasm';
// const keys = await emsg_generateKeyPair();
// await emsg_sendMessage('alice#example.com', 'bob#test.org', 'Hello!');
