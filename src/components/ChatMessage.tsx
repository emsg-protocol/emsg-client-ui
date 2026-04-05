import React from 'react';

interface ChatMessageProps {
  from: string;
  content: string;
  timestamp: string | number;
  isOwn?: boolean;
  system?: boolean;
}

export default function ChatMessage({ from, content, timestamp, isOwn, system }: ChatMessageProps) {
  return (
    <div className={`flex items-end gap-3 ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}> 
      {!isOwn && !system && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-200 via-blue-200 to-blue-400 dark:from-green-900 dark:via-blue-900 dark:to-blue-700 flex items-center justify-center text-lg text-white font-bold shadow-lg border-2 border-white dark:border-gray-900">
          {from.charAt(0).toUpperCase()}
        </div>
      )}
      <div
        className={`max-w-[70%] px-5 py-3 rounded-3xl shadow-xl text-base mb-2 whitespace-pre-line transition-all duration-200 border backdrop-blur-lg
          ${system
            ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/70 dark:text-blue-200 border-blue-200 dark:border-blue-800'
            : isOwn
            ? 'bg-green-400/80 text-white dark:bg-green-700/80 dark:text-white border-green-200 dark:border-green-800'
            : 'bg-white/80 text-gray-900 dark:bg-gray-800/70 dark:text-gray-100 border-gray-200 dark:border-gray-700'}
          hover:shadow-2xl
        `}
      >
        {!system && (
          <div className="text-xs text-gray-400 dark:text-gray-300 mb-2 flex justify-between">
            <span className="font-semibold">{isOwn ? 'You' : from}</span>
            <span>{typeof timestamp === 'string' ? new Date(timestamp).toLocaleTimeString() : new Date(timestamp).toLocaleTimeString()}</span>
          </div>
        )}
        <div>{content}</div>
        {system && <div className="text-xs mt-1 italic">System Message</div>}
      </div>
      {isOwn && !system && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-700 dark:from-green-800 dark:to-green-900 flex items-center justify-center text-xl text-white font-bold shadow-lg border-2 border-white dark:border-gray-900">
          😊
        </div>
      )}
    </div>
  );
}

// Tailwind animation (add to your global CSS if not present):
// .animate-fade-in { animation: fadeIn 0.4s ease; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

