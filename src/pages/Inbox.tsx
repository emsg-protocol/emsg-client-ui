import React, { useEffect, useState, useCallback } from 'react';
import { fetchInbox, Message } from '../services/api';
import { useKeyStore } from '../hooks/useKeyStore';
import { Loading, ErrorMessage } from '../components/Status';
import { useEmsgWebSocket, EmsgWsEvent } from '../hooks/useEmsgWebSocket';
import { useMessageStore } from '../hooks/useMessageStore';

export default function Inbox() {
  const { publicKey, privateKey } = useKeyStore();
  const { messages, setMessages, addMessage } = useMessageStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsError, setWsError] = useState(null);
  const [wsStatus, setWsStatus] = useState('connecting');

  // Handler for new WebSocket messages
  const handleWsMessage = useCallback((event: EmsgWsEvent) => {
    if (typeof event !== 'object' || typeof event.type !== 'string') {
      setWsError('Malformed event received');
      return;
    }
    if (event.type === 'new_message' && event.payload) {
      addMessage(event.payload);
    }
  }, [addMessage]);

  // Connect to WebSocket (replace with actual endpoint if needed)
  const wsToken = privateKey || undefined; // Example: use privateKey as token, replace with real auth
  const ws = useEmsgWebSocket(
    'ws://localhost:8080/ws',
    handleWsMessage,
    {
      token: wsToken,
      onError: (err) => setWsError(err.message),
      allowedTypes: ['new_message', 'system', 'group'],
    }
  );

  useEffect(() => {
    setWsStatus(ws.status);
  }, [ws.status]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchInbox()
      .then((msgs) => {
        setMessages(Array.isArray(msgs) ? msgs : []);
      })
      .catch((e) => setError(e.message || 'Failed to load messages'))
      .finally(() => setLoading(false));
  }, [publicKey, setMessages]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">📥 Inbox</h2>
      <div className="mb-2 text-sm">
        WebSocket: <span className={
          wsStatus === 'open' ? 'text-green-600' :
          wsStatus === 'connecting' ? 'text-yellow-600' :
          wsStatus === 'error' ? 'text-red-600' :
          'text-gray-500'}>{wsStatus}</span>
        {wsError && <span className="ml-2 text-red-600">{wsError}</span>}
      </div>
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
