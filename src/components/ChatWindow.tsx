import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const chatHeaders: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'Inbox', subtitle: 'Direct Messages' },
  '/group': { title: 'Group Chat', subtitle: 'Group conversation' },
  '/sent': { title: 'Sent', subtitle: 'Your sent messages' },
  '/system': { title: 'System', subtitle: 'System notifications' },
};

export default function ChatWindow() {
  const location = useLocation();
  const header = chatHeaders[location.pathname] || { title: 'Chat' };
  return (
    <main className="flex-1 flex flex-col h-full relative p-0 md:p-6">
      {/* Chat card */}
      <div className="relative flex flex-col flex-1 bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden backdrop-blur-xl">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-8 py-6 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur z-10">
          <div className="rounded-full bg-green-200 dark:bg-green-900 h-12 w-12 flex items-center justify-center text-3xl text-green-700 dark:text-green-300 shadow">
            💬
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-gray-900 dark:text-gray-100">{header.title}</span>
            {header.subtitle && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{header.subtitle}</span>
            )}
          </div>
        </div>
        {/* Chat background pattern */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 opacity-90" />
        {/* Chat content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
