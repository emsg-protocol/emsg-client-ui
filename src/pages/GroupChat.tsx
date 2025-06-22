import React, { useEffect, useState, useCallback } from 'react';
import { useKeyStore } from '../hooks/useKeyStore';
import { wasm } from '../services/api';
import { useEmsgWebSocket, EmsgWsEvent } from '../hooks/useEmsgWebSocket';
import { Loading, ErrorMessage } from '../components/Status';

export default function GroupChat() {
  const { publicKey, privateKey } = useKeyStore();
  const [group, setGroup] = useState('default-group');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wsStatus, setWsStatus] = useState('connecting');

  // Handle incoming group messages
  const handleWsMessage = useCallback((event: EmsgWsEvent) => {
    if (event.type === 'group_message' && event.payload && event.payload.group === group) {
      setMessages((prev) => [event.payload, ...prev]);
    }
  }, [group]);

  const ws = useEmsgWebSocket(
    'ws://localhost:8080/ws',
    handleWsMessage,
    {
      token: privateKey || undefined,
      allowedTypes: ['group_message'],
      onError: (err) => setError(err.message),
    }
  );

  useEffect(() => {
    setWsStatus(ws.status);
  }, [ws.status]);

  // Fetch initial group messages (mocked for now)
  useEffect(() => {
    setLoading(true);
    setError(null);
    // TODO: Replace with real group fetch from WASM/REST
    setMessages([]);
    setLoading(false);
  }, [group]);

  async function handleSend(e) {
    e.preventDefault();
    setError(null);
    if (!input.trim()) return;
    setLoading(true);
    try {
      if (!privateKey || !publicKey) throw new Error('No key pair');
      await wasm.initClient(privateKey);
      // For demo, send as group message type
      // TODO: Use real group send API
      ws.send({ type: 'group_message', payload: { from: publicKey, group, content: input, timestamp: new Date().toISOString() } });
      setInput('');
    } catch (e) {
      setError(e.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">👥 Group Chat: {group}</h2>
      <div className="mb-2 text-sm">
        WebSocket: <span className={
          wsStatus === 'open' ? 'text-green-600' :
          wsStatus === 'connecting' ? 'text-yellow-600' :
          wsStatus === 'error' ? 'text-red-600' :
          'text-gray-500'}>{wsStatus}</span>
      </div>
      {loading && <Loading />}
      {error && <ErrorMessage error={error} />}
      <form onSubmit={handleSend} className="flex gap-2 mb-4">
        <input
          className="flex-1 p-2 border rounded dark:bg-gray-800 dark:text-gray-100"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          type="submit"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
      <ul className="space-y-3">
        {messages.length === 0 && <li className="text-gray-400">No group messages.</li>}
        {messages.map((msg, i) => (
          <li key={i} className="border rounded p-3 bg-white dark:bg-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span>From: {msg.from}</span> <span className="ml-2">{new Date(msg.timestamp).toLocaleString()}</span>
            </div>
            <div className="text-gray-900 dark:text-gray-100">{msg.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
