import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Inbox', icon: '📥' },
  { to: '/group', label: 'Group Chat', icon: '👥' },
  { to: '/sent', label: 'Sent', icon: '📤' },
  { to: '/system', label: 'System', icon: '⚙️' },
];

export default function Sidebar() {
  const location = useLocation();
  const [isDark, setIsDark] = React.useState(() =>
    typeof window !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  );

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <aside className="w-64 min-w-[220px] max-w-xs h-full flex flex-col bg-white/70 dark:bg-gray-900/70 border-r border-gray-200 dark:border-gray-800 shadow-2xl backdrop-blur-lg rounded-r-3xl p-0">
      <div className="flex items-center justify-between px-7 py-6 mb-3">
        <span className="font-black text-2xl text-green-600 dark:text-green-400 tracking-tight select-none drop-shadow">emsg</span>
        <button
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-yellow-500 dark:text-yellow-300 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-lg"
          onClick={() => setIsDark((d) => !d)}
          type="button"
        >
          {isDark ? '🌙' : '☀️'}
        </button>
      </div>
      <nav className="flex-1 flex flex-col gap-2 px-5">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition font-semibold text-base hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-800 dark:hover:text-green-200 focus:outline-none focus:ring-2 focus:ring-green-400/40 shadow-sm ${location.pathname === item.to ? 'bg-green-500 text-white dark:bg-green-700 dark:text-white shadow-lg' : 'text-gray-700 dark:text-gray-200'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-7 py-6 text-xs text-gray-400 dark:text-gray-600 select-none">
        <span className="block font-bold text-gray-500 dark:text-gray-400 mb-1">Cascade UI Demo</span>
        <span>Modern WhatsApp-style chat UI</span>
      </div>
    </aside>
  );
}
