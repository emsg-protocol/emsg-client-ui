import create from 'zustand';

interface AuthState {
  user: {
    id: string;
    displayName: string;
    domain: string;
  } | null;
  setUser: (user: { id: string; displayName: string; domain: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
