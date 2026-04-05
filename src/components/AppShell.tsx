import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ChatListPanel from './ChatListPanel';
import ChatArea from './ChatArea';
import { useAuthStore } from '../hooks/useAuthStore';

export type ChatEntry = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isGroup: boolean;
  avatar?: string;
};

// Mock chat list — replace with real data from store/API
const MOCK_CHATS: ChatEntry[] = [
  { id: 'alice#example.com', name: 'alice#example.com', lastMessage: 'Hey, how are you?', timestamp: '10:42 am', unread: 2, isGroup: false },
  { id: 'bob#example.com', name: 'bob#example.com', lastMessage: 'Got your message!', timestamp: 'Yesterday', unread: 0, isGroup: false },
  { id: 'dev-team', name: 'Dev Team', lastMessage: 'Build passed ✅', timestamp: 'Yesterday', unread: 5, isGroup: true },
  { id: 'general', name: 'General', lastMessage: 'Welcome everyone!', timestamp: 'Mon', unread: 0, isGroup: true },
];

export default function AppShell() {
  const [activeChat, setActiveChat] = useState<ChatEntry | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const address = useAuthStore((s) => s.address);
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const filtered = MOCK_CHATS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-[#f0f2f5] text-gray-900 overflow-hidden">
      {/* Left panel */}
      <ChatListPanel
        chats={filtered}
        activeChat={activeChat}
        onSelect={setActiveChat}
        search={search}
        onSearch={setSearch}
        userAddress={address}
        onLogout={handleLogout}
        onSettings={() => navigate('/settings')}
      />

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <ChatArea chat={activeChat} userAddress={address} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] select-none">
      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow">
        <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#8696a0]" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      <h2 className="text-gray-800 text-2xl font-light mb-2">EMSG Web</h2>
      <p className="text-[#8696a0] text-sm text-center max-w-xs">
        Select a chat to start messaging. Your messages are end-to-end encrypted with Ed25519.
      </p>
      <div className="mt-8 flex items-center gap-2 text-[#8696a0] text-xs">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
        </svg>
        End-to-end encrypted
      </div>
    </div>
  );
}
