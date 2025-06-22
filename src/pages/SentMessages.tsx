import React, { useEffect, useState } from 'react';
import { fetchSentMessages, Message } from '../services/api';
import { useKeyStore } from '../hooks/useKeyStore';
import { Loading, ErrorMessage } from '../components/Status';

export default function SentMessages() {
  const { publicKey } = useKeyStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const userAddress = publicKey ? publicKey : 'bob@emsg';
    fetchSentMessages(userAddress)
      .then((msgs) => {
        setMessages(Array.isArray(msgs) ? msgs : []);
      })
      .catch((e) => setError(e.message || 'Failed to load sent messages'))
      .finally(() => setLoading(false));
  }, [publicKey]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">📤 Sent Messages</h2>
      {loading && <Loading />}
      {error && <ErrorMessage error={error} />}
      {!loading && !error && (
        <ul className="space-y-3">
          {messages.length === 0 && <li className="text-gray-400">No sent messages.</li>}
          {messages.map(msg => (
            <li key={msg.id} className="border rounded p-3 bg-white dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>To: {msg.to}</span> <span className="ml-2">{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-gray-900 dark:text-gray-100">{msg.content}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
