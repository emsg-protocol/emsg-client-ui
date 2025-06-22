// src/services/api.ts
// Unified API interface for EMSG Client UI
// Switch between mock, REST, and WASM API using API_MODE

import * as emsgWasm from './emsg-wasm';

// Modes: 'mock', 'rest', 'wasm'
const API_MODE: 'mock' | 'rest' | 'wasm' = 'wasm';

export type Message = {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  group?: string;
  system?: boolean;
};

export type User = {
  id: string;
  displayName: string;
  domain: string;
};

// --- Mock API ---
export const mockMessages: Message[] = [
  {
    id: '1',
    from: 'alice@emsg',
    to: 'bob@emsg',
    content: 'Hello Bob!',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    from: 'system',
    to: 'bob@emsg',
    content: 'You joined the group.',
    timestamp: new Date().toISOString(),
    system: true,
  },
];

export const mockUser: User = {
  id: 'bob@emsg',
  displayName: 'Bob',
  domain: 'emsg',
};

// --- Real API (REST) ---
const API_BASE = '/api';

async function realFetchInbox(): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/inbox`);
  if (!res.ok) throw new Error('Failed to fetch inbox');
  return res.json();
}

async function realFetchUser(): Promise<User> {
  const res = await fetch(`${API_BASE}/user`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

async function realSendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  const res = await fetch(`${API_BASE}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

// --- WASM API ---
async function wasmGenerateKeyPair() {
  return emsgWasm.emsg_generateKeyPair();
}

async function wasmImportPrivateKey(privHex: string) {
  return emsgWasm.emsg_importPrivateKey(privHex);
}

async function wasmInitClient(privHex: string) {
  return emsgWasm.emsg_initClient(privHex);
}

async function wasmSendMessage(from: string, to: string, content: string) {
  return emsgWasm.emsg_sendMessage(from, to, content);
}

async function wasmGetMessages(user: string) {
  return emsgWasm.emsg_getMessages(user);
}

// --- Unified API ---
export function fetchInbox(): Promise<Message[]> {
  if (API_MODE === 'mock') return Promise.resolve(mockMessages);
  if (API_MODE === 'rest') return realFetchInbox();
  // WASM: get messages for current user (must call wasmInitClient first)
  return wasmGetMessages('bob@emsg'); // TODO: use actual user
}

export function fetchUser(): Promise<User> {
  if (API_MODE === 'mock') return Promise.resolve(mockUser);
  if (API_MODE === 'rest') return realFetchUser();
  // WASM: not implemented, return mock for now
  return Promise.resolve(mockUser);
}

export function sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  if (API_MODE === 'mock') {
    const newMsg: Message = {
      ...message,
      id: String(Date.now()),
      timestamp: new Date().toISOString(),
    };
    mockMessages.push(newMsg);
    return Promise.resolve(newMsg);
  }
  if (API_MODE === 'rest') return realSendMessage(message);
  // WASM: must call wasmInitClient first
  return wasmSendMessage(message.from, message.to, message.content).then((res) => {
    if (res.error) throw new Error(res.error);
    return {
      ...message,
      id: String(Date.now()),
      timestamp: new Date().toISOString(),
    };
  });
}

export const wasm = {
  generateKeyPair: wasmGenerateKeyPair,
  importPrivateKey: wasmImportPrivateKey,
  initClient: wasmInitClient,
  sendMessage: wasmSendMessage,
  getMessages: wasmGetMessages,
};
