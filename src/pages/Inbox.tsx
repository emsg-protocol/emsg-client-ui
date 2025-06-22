import React, { useEffect, useState, useCallback } from 'react';
import { fetchInbox, Message } from '../services/api';
import { useKeyStore } from '../hooks/useKeyStore';
import { Loading, ErrorMessage } from '../components/Status';
import { useEmsgWebSocket, EmsgWsEvent } from '../hooks/useEmsgWebSocket';

export default function Inbox() {
  const { publicKey } = useKeyStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handler for new WebSocket messages
  const handleWsMessage = useCallback((event: EmsgWsEvent) => {
    if (event.type === 'new_message' && event.payload) {
      setMessages((prev) => [event.payload, ...prev]);
    }
  }, []);

  // Connect to WebSocket (replace with actual endpoint if needed)
  useEmsgWebSocket('ws://localhost:8080/ws', handleWsMessage);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchInbox()
      .then((msgs) => {
        setMessages(Array.isArray(msgs) ? msgs : []);
      })
      .catch((e) => setError(e.message || 'Failed to load messages'))
      .finally(() => setLoading(false));
  }, [publicKey]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">📥 Inbox</h2>
      {loading && <Loading />}
      {error && <ErrorMessage error={error} />}
      {!loading && !error && (
        <ul className="space-y-3">
          {messages.length === 0 && <li className="text-gray-400">No messages.</li>}
          {messages.map(msg => (
            <li key={msg.id} className="border rounded p-3 bg-white dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>From: {msg.from}</span> <span className="ml-2">{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-gray-900 dark:text-gray-100">{msg.content}</div>
              {msg.system && <div className="text-xs text-blue-500 mt-1">System Message</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
