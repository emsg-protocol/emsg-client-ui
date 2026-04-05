import React, { useEffect, useState, useCallback } from 'react';
import { useKeyStore } from '../hooks/useKeyStore';
import { wasm } from '../services/api';
import { useEmsgWebSocket, EmsgWsEvent } from '../hooks/useEmsgWebSocket';
import { Loading, ErrorMessage } from '../components/Status';
import ChatMessage from '../components/ChatMessage';

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
      <div className="flex flex-col h-[60vh] bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner p-2 mb-2 overflow-y-auto">
        <div className="flex flex-col-reverse gap-2 flex-1 overflow-y-auto">
          {messages.length === 0 && <div className="text-gray-400">No group messages.</div>}
          {messages.slice().reverse().map((msg, i) => (
            // 'key' is only for the React element, not a prop for ChatMessage
            <React.Fragment key={i}>
              <ChatMessage
                from={msg.from}
                content={msg.content}
                timestamp={msg.timestamp}
                isOwn={msg.from === publicKey}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
      <form
        onSubmit={handleSend}
        className="w-full flex items-center gap-3 px-4 py-3 md:px-6 md:py-4 bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl backdrop-blur-lg fixed bottom-0 left-0 right-0 md:left-auto md:right-auto md:mx-12 md:mb-8 z-20"
        style={{ maxWidth: '700px', margin: '0 auto' }}
      >
        <input
          type="text"
          className="flex-1 rounded-full px-5 py-3 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400/60 dark:bg-gray-900/70 dark:text-white bg-gray-100/70 shadow-inner text-base"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white font-bold shadow-lg hover:from-green-500 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-400/60 transition-all text-base"
          disabled={loading || !input.trim()}
        >
          <span className="hidden md:inline">Send</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </button>
      </form>
    </div>
  );
}
