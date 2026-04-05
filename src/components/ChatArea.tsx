import React, { useState, useRef, useEffect } from 'react';
import type { ChatEntry } from './AppShell';

interface Message {
  id: string;
  from: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

// Mock messages per chat
const MOCK_MESSAGES: Record<string, Message[]> = {
  'alice#example.com': [
    { id: '1', from: 'alice#example.com', content: 'Hey, how are you?', timestamp: '10:40 am', isOwn: false },
    { id: '2', from: 'me', content: 'Doing great! You?', timestamp: '10:41 am', isOwn: true },
    { id: '3', from: 'alice#example.com', content: 'Same! Working on the EMSG client.', timestamp: '10:42 am', isOwn: false },
  ],
  'bob#example.com': [
    { id: '1', from: 'bob#example.com', content: 'Got your message!', timestamp: 'Yesterday', isOwn: false },
  ],
  'dev-team': [
    { id: '1', from: 'alice#example.com', content: 'Build passed ✅', timestamp: 'Yesterday', isOwn: false },
    { id: '2', from: 'me', content: 'Nice work everyone!', timestamp: 'Yesterday', isOwn: true },
  ],
  'general': [
    { id: '1', from: 'system', content: 'Welcome everyone!', timestamp: 'Mon', isOwn: false },
  ],
};

interface Props {
  chat: ChatEntry;
  userAddress: string | null;
}

export default function ChatArea({ chat, userAddress }: Props) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES[chat.id] || []);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(MOCK_MESSAGES[chat.id] || []);
  }, [chat.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      from: userAddress || 'me',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
  }

  return (
    <div className="flex flex-col h-full bg-[#efeae2]">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#f0f2f5] border-b border-[#e9edef]">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0"
          style={{ backgroundColor: '#6b7280' }}
        >
          {chat.isGroup ? (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          ) : chat.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-gray-800 text-sm font-medium truncate">{chat.name}</div>
          <div className="text-[#667781] text-xs">{chat.isGroup ? 'Group' : 'Direct message'}</div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-[#e9edef] text-[#54656f] transition" title="Search">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-[#e9edef] text-[#54656f] transition" title="More">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.length === 0 && (
          <div className="text-center text-[#667781] text-sm mt-8">No messages yet. Say hello!</div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} msg={msg} showAvatar={!msg.isOwn && (i === 0 || messages[i - 1]?.isOwn)} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 px-4 py-3 bg-[#f0f2f5]"
      >
        <button type="button" className="p-2 text-[#54656f] hover:text-gray-800 transition flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>
        </button>
        <button type="button" className="p-2 text-[#54656f] hover:text-gray-800 transition flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
          </svg>
        </button>
        <input
          className="flex-1 bg-white text-gray-800 placeholder-[#8696a0] rounded-lg px-4 py-2.5 text-sm outline-none border border-[#e9edef]"
          placeholder="Type a message"
          value={input}
          onChange={e => setInput(e.target.value)}
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 text-[#54656f] hover:text-[#00a884] disabled:opacity-40 transition flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ msg, showAvatar }: { msg: Message; showAvatar: boolean }) {
  return (
    <div className={`flex items-end gap-2 animate-fade-in-up ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
      {!msg.isOwn && (
        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold text-white ${showAvatar ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundColor: '#6b7280' }}>
          {msg.from.charAt(0).toUpperCase()}
        </div>
      )}
      <div
        className={`max-w-[65%] px-3 py-2 rounded-lg text-sm relative
          ${msg.isOwn
            ? 'bg-[#d9fdd3] text-gray-800 rounded-tr-none'
            : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
          }`}
      >
        <div className="break-words">{msg.content}</div>
        <div className="text-[10px] text-[#8696a0] mt-1 text-right flex items-center justify-end gap-1">
          {msg.timestamp}
          {msg.isOwn && (
            <svg viewBox="0 0 18 18" className="w-3.5 h-3.5 text-[#53bdeb]" fill="currentColor">
              <path d="M17.394 5.035l-.57-.444a.434.434 0 0 0-.609.076L8.397 14.3l-3.713-4.18a.434.434 0 0 0-.648-.027l-.52.52a.434.434 0 0 0-.027.648l4.43 4.99a.434.434 0 0 0 .648.027l9.855-10.59a.434.434 0 0 0-.028-.653zm-4.041 0l-.57-.444a.434.434 0 0 0-.609.076L4.356 14.3l-1.713-1.93a.434.434 0 0 0-.648-.027l-.52.52a.434.434 0 0 0-.027.648l2.43 2.74a.434.434 0 0 0 .648.027l9.855-10.59a.434.434 0 0 0-.028-.653z"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
