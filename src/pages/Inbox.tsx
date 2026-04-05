import React, { useEffect, useState, useCallback } from 'react';
import { fetchInbox, Message } from '../services/api';
import { useKeyStore } from '../hooks/useKeyStore';
import { Loading, ErrorMessage } from '../components/Status';
import { useEmsgWebSocket, EmsgWsEvent } from '../hooks/useEmsgWebSocket';
import { useMessageStore } from '../hooks/useMessageStore';
import ChatMessage from '../components/ChatMessage';

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
        <div className="flex flex-col-reverse gap-2 max-h-[60vh] overflow-y-auto pb-2">
          {messages.length === 0 && <div className="text-gray-400">No messages.</div>}
          {messages.slice().reverse().map(msg => (
            // 'key' is only for the React element, not a prop for ChatMessage
            <React.Fragment key={msg.id}>
              <ChatMessage
                from={msg.from}
                content={msg.content}
                timestamp={msg.timestamp}
                isOwn={msg.from === publicKey}
                system={msg.system}
              />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
