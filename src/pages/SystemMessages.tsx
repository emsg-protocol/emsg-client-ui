import React, { useEffect, useState } from 'react';
import { fetchInbox, Message } from '../services/api';
import { useKeyStore } from '../hooks/useKeyStore';
import { Loading, ErrorMessage } from '../components/Status';

export default function SystemMessages() {
  const { publicKey } = useKeyStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Use the user's public key or fallback to default address
    const userAddress = publicKey ? publicKey : 'bob@emsg';
    fetchInbox()
      .then((msgs) => {
        // Filter for system messages
        const systemMsgs = Array.isArray(msgs) ? msgs.filter(msg => msg.system) : [];
        setMessages(systemMsgs);
      })
      .catch((e) => setError(e.message || 'Failed to load system messages'))
      .finally(() => setLoading(false));
  }, [publicKey]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">🧾 System Messages</h2>
      {loading && <Loading />}
      {error && <ErrorMessage error={error} />}
      {!loading && !error && (
        <ul className="space-y-3">
          {messages.length === 0 && <li className="text-gray-400">No system messages.</li>}
          {messages.map(msg => (
            <li key={msg.id} className="border rounded p-3 bg-white dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>To: {msg.to}</span> <span className="ml-2">{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-blue-700 dark:text-blue-300 font-medium">{msg.content}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
