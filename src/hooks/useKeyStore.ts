import create from 'zustand';

export interface KeyState {
  privateKey: string | null; // hex or base64
  publicKey: string | null; // hex or base64
  setKeys: (priv: string, pub: string) => void;
  clearKeys: () => void;
}

export const useKeyStore = create<KeyState>((set) => ({
  privateKey: null,
  publicKey: null,
  setKeys: (privateKey, publicKey) => set({ privateKey, publicKey }),
  clearKeys: () => set({ privateKey: null, publicKey: null }),
}));
