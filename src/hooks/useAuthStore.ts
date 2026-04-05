import { create } from 'zustand';
import { EncryptedBlob } from '../services/keyCrypto';

export type AuthMode = 'password' | 'key';

export interface AuthState {
  address: string | null;
  authMode: AuthMode | null;
  privateKey: string | null;   // hex, in-memory only, never persisted
  publicKey: string | null;
  encryptedBlob: EncryptedBlob | null; // Mode A only, in-memory only
  setAuth: (
    address: string,
    authMode: AuthMode,
    privateKey: string,
    publicKey: string,
    blob?: EncryptedBlob
  ) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  address: null,
  authMode: null,
  privateKey: null,
  publicKey: null,
  encryptedBlob: null,
  setAuth: (address, authMode, privateKey, publicKey, blob) =>
    set({
      address,
      authMode,
      privateKey,
      publicKey,
      encryptedBlob: blob ?? null,
    }),
  logout: () =>
    set({
      address: null,
      authMode: null,
      privateKey: null,
      publicKey: null,
      encryptedBlob: null,
    }),
}));
