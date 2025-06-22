import { create } from 'zustand';
import { Message } from '../services/api';

interface MessageState {
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((state) => ({ messages: [msg, ...state.messages] })),
  clearMessages: () => set({ messages: [] }),
}));
