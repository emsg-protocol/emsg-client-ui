import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Inbox from './pages/Inbox';
import ComposeMessage from './pages/ComposeMessage';
import SentMessages from './pages/SentMessages';
import GroupChat from './pages/GroupChat';
import SystemMessages from './pages/SystemMessages';
import KeyPair from './pages/KeyPair';
import Settings from './pages/Settings';
import DevPanel from './pages/DevPanel';
import Login from './pages/Login';

function useTheme() {
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
  return [isDark, setIsDark] as const;
}

import { useEmsgWebSocket } from './hooks/useEmsgWebSocket';
import { useKeyStore } from './hooks/useKeyStore';

function NavBar() {
  const [isDark, setIsDark] = useTheme();
  // Example WebSocket endpoint (replace with actual if needed)
  const { status } = useEmsgWebSocket('ws://localhost:8080/ws', () => {});
  const statusColor =
    status === 'open' ? 'bg-green-500' : status === 'connecting' ? 'bg-yellow-400' : 'bg-red-500';
  const statusText =
    status === 'open'
      ? 'Connected to EMSG server'
      : status === 'connecting'
      ? 'Connecting to EMSG server...'
      : 'Disconnected from EMSG server';
  return (
    <nav
      className="flex flex-wrap md:flex-nowrap gap-2 p-4 bg-gray-200 dark:bg-gray-800 items-center"
      aria-label="Main navigation"
    >
      <span
        className={`inline-block w-3 h-3 rounded-full mr-2 ${statusColor}`}
        title={statusText}
        aria-label={statusText}
        tabIndex={0}
      ></span>
      <Link to="/" className="font-medium text-blue-600 dark:text-blue-300 focus:outline-none focus:ring" tabIndex={0} aria-label="Inbox Page">Inbox</Link>
      <Link to="/compose" className="font-medium text-blue-600 dark:text-blue-300 focus:outline-none focus:ring" tabIndex={0} aria-label="Compose Message Page">Compose</Link>
      <Link to="/sent" className="font-medium text-blue-600 dark:text-blue-300 focus:outline-none focus:ring" tabIndex={0} aria-label="Sent Messages Page">Sent</Link>
      <Link to="/group" className="font-medium text-blue-600 dark:text-blue-300 focus:outline-none focus:ring" tabIndex={0} aria-label="Group Chat Page">Group Chat</Link>
      <Link to="/system" className="font-medium text-blue-600 dark:text-blue-300 focus:outline-none focus:ring" tabIndex={0} aria-label="System Messages Page">System</Link>
      <Link to="/keypair" className="font-medium text-blue-600 dark:text-blue-300 focus:outline-none focus:ring" tabIndex={0} aria-label="Key Pair Page">Key Pair</Link>
      <Link to="/settings" className="font-medium text-blue-600 dark:text-blue-300 focus:outline-none focus:ring" tabIndex={0} aria-label="Settings Page">Settings</Link>
      <Link to="/dev" className="font-medium text-blue-600 dark:text-blue-300 focus:outline-none focus:ring" tabIndex={0} aria-label="Developer Debug Panel">Dev Panel</Link>
      <button
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="ml-auto px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring"
        onClick={() => setIsDark((d) => !d)}
        type="button"
      >
        {isDark ? '🌙 Dark' : '☀️ Light'}
      </button>
    </nav>
  );
}

function App() {
  const { privateKey } = useKeyStore();
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <NavBar />
        <div className="max-w-2xl mx-auto mt-6">
          <Routes>
            {!privateKey && <Route path="*" element={<Login />} />}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Inbox />} />
            <Route path="/compose" element={<ComposeMessage />} />
            <Route path="/sent" element={<SentMessages />} />
            <Route path="/group" element={<GroupChat />} />
            <Route path="/system" element={<SystemMessages />} />
            <Route path="/keypair" element={<KeyPair />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dev" element={<DevPanel />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
