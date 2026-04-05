import React, { useState } from 'react';
import type { ChatEntry } from './AppShell';

interface Props {
  chats: ChatEntry[];
  activeChat: ChatEntry | null;
  onSelect: (chat: ChatEntry) => void;
  search: string;
  onSearch: (v: string) => void;
  userAddress: string | null;
  onLogout: () => void;
  onSettings: () => void;
}

function Avatar({ name, isGroup, size = 'md' }: { name: string; isGroup: boolean; size?: 'sm' | 'md' }) {
  const initials = name.charAt(0).toUpperCase();
  const colors = ['#6b7280', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-lg';
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {isGroup ? (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      ) : initials}
    </div>
  );
}

export default function ChatListPanel({ chats, activeChat, onSelect, search, onSearch, userAddress, onLogout, onSettings }: Props) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="w-[380px] min-w-[320px] flex flex-col bg-white border-r border-[#e9edef]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f0f2f5]">
        <div className="flex items-center gap-3">
          <Avatar name={userAddress || 'U'} isGroup={false} />
          <span className="text-gray-800 text-sm font-medium truncate max-w-[160px]">
            {userAddress || 'EMSG'}
          </span>
        </div>
        <div className="flex items-center gap-1 relative">
          <button
            onClick={onSettings}
            className="p-2 rounded-full hover:bg-[#e9edef] text-[#54656f] transition"
            title="Settings"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
          </button>
          <button
            onClick={() => setShowMenu(v => !v)}
            className="p-2 rounded-full hover:bg-[#e9edef] text-[#54656f] transition"
            title="Menu"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white rounded-lg shadow-xl z-50 py-1 min-w-[160px] border border-[#e9edef]">
              <button
                onClick={() => { setShowMenu(false); onSettings(); }}
                className="w-full text-left px-4 py-2 text-gray-700 text-sm hover:bg-[#f0f2f5]"
              >
                Settings
              </button>
              <button
                onClick={() => { setShowMenu(false); onLogout(); }}
                className="w-full text-left px-4 py-2 text-gray-700 text-sm hover:bg-[#f0f2f5]"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-white">
        <div className="flex items-center gap-2 bg-[#f0f2f5] rounded-lg px-3 py-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#54656f] flex-shrink-0" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            className="flex-1 bg-transparent text-gray-800 text-sm placeholder-[#8696a0] outline-none"
            placeholder="Search or start new chat"
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto bg-white">
        {chats.length === 0 && (
          <div className="text-[#8696a0] text-sm text-center mt-8 px-4">No chats found</div>
        )}
        {chats.map(chat => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={activeChat?.id === chat.id}
            onClick={() => onSelect(chat)}
          />
        ))}
      </div>
    </div>
  );
}

function ChatListItem({ chat, isActive, onClick }: { chat: ChatEntry; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 border-b border-[#e9edef] transition text-left
        ${isActive ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}`}
    >
      <Avatar name={chat.name} isGroup={chat.isGroup} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-gray-800 text-sm font-medium truncate">{chat.name}</span>
          <span className="text-[#667781] text-xs flex-shrink-0 ml-2">{chat.timestamp}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[#667781] text-xs truncate">{chat.lastMessage}</span>
          {chat.unread > 0 && (
            <span className="ml-2 flex-shrink-0 bg-[#00a884] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
