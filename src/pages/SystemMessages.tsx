import React, { useEffect, useState, useCallback } from 'react';
import { useEmsgWebSocket, EmsgWsEvent } from '../hooks/useEmsgWebSocket';
import { Loading, ErrorMessage } from '../components/Status';

export default function SystemMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wsStatus, setWsStatus] = useState('connecting');

  // Handle incoming system messages
  const handleWsMessage = useCallback((event: EmsgWsEvent) => {
    if (event.type === 'system' && event.payload) {
      setMessages((prev) => [event.payload, ...prev]);
    }
  }, []);

  const ws = useEmsgWebSocket(
    'ws://localhost:8080/ws',
    handleWsMessage,
    {
      allowedTypes: ['system'],
      onError: (err) => setError(err.message),
    }
  );

  useEffect(() => {
    setWsStatus(ws.status);
  }, [ws.status]);

  // Optionally, fetch initial system messages from API here

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">🧾 System Messages</h2>
      <div className="mb-2 text-sm">
        WebSocket: <span className={
          wsStatus === 'open' ? 'text-green-600' :
          wsStatus === 'connecting' ? 'text-yellow-600' :
          wsStatus === 'error' ? 'text-red-600' :
          'text-gray-500'}>{wsStatus}</span>
      </div>
      {loading && <Loading />}
      {error && <ErrorMessage error={error} />}
      <ul className="space-y-3">
        {messages.length === 0 && <li className="text-gray-400">No system messages.</li>}
        {messages.map((msg, i) => (
          <li key={i} className="border rounded p-3 bg-white dark:bg-gray-800">
            <div className="text-sm text-blue-600 dark:text-blue-300 mb-1">{msg.eventType || 'System Event'}</div>
            <div className="text-gray-900 dark:text-gray-100">{msg.content}</div>
            <div className="text-xs text-gray-500 mt-1">{msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
