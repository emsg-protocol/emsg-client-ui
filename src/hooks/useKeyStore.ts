import { useAuthStore } from './useAuthStore';

export interface KeyState {
  privateKey: string | null;
  publicKey: string | null;
  setKeys: (priv: string, pub: string) => void;
  clearKeys: () => void;
}

export function useKeyStore(): KeyState {
  const privateKey = useAuthStore((s) => s.privateKey);
  const publicKey = useAuthStore((s) => s.publicKey);

  return {
    privateKey,
    publicKey,
    setKeys: (priv: string, pub: string) => {
      const address = useAuthStore.getState().address;
      useAuthStore.getState().setAuth(address || '', 'key', priv, pub);
    },
    clearKeys: () => {
      useAuthStore.getState().logout();
    },
  };
}
