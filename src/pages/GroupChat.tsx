import React, { useEffect, useState } from 'react';
import { useKeyStore } from '../hooks/useKeyStore';
import { wasm } from '../services/api';
import { Button } from '../components/Button';
import { Loading, ErrorMessage } from '../components/Status';

interface GroupMessage {
  id: string;
  from: string;
  group: string;
  content: string;
  timestamp: string;
  system?: boolean;
}

export default function GroupChat() {
  const { privateKey, publicKey } = useKeyStore();
  const [groupId, setGroupId] = useState('team-alpha');
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch group messages (simulate by filtering all messages for group)
  useEffect(() => {
    async function fetchGroupMessages() {
      setFetching(true);
      setError(null);
      try {
        if (!publicKey) throw new Error('No user key loaded');
        // Fetch all messages for user
        const allMsgs = await wasm.getMessages(publicKey);
        // Filter for group messages
        const groupMsgs = Array.isArray(allMsgs)
          ? allMsgs.filter((msg: any) => msg.group === groupId)
          : [];
        setMessages(groupMsgs);
      } catch (e: any) {
        setError(e.message || 'Failed to load group messages');
      } finally {
        setFetching(false);
      }
    }
    fetchGroupMessages();
  }, [publicKey, groupId, success]);

  // Send group message
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      if (!privateKey || !publicKey) throw new Error('You must generate or import a key pair first.');
      await wasm.initClient(privateKey);
      // For group, we use groupId as the 'to' field and set group property
      const sendRes = await wasm.sendMessage(publicKey, groupId, message);
      if (sendRes.error) throw new Error(sendRes.error);
      setSuccess(true);
      setMessage('');
    } catch (e: any) {
      setError(e.message || 'Failed to send group message');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">👥 Group Chat</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1">Group ID:</label>
        <input
          className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100 mb-2"
          value={groupId}
          onChange={e => setGroupId(e.target.value)}
          placeholder="Enter group ID"
        />
      </div>
      {fetching && <Loading />}
      {error && <ErrorMessage error={error} />}
      {!fetching && !error && (
        <ul className="space-y-3 mb-6">
          {messages.length === 0 && <li className="text-gray-400">No group messages.</li>}
          {messages.map(msg => (
            <li key={msg.id} className="border rounded p-3 bg-white dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>From: {msg.from}</span> <span className="ml-2">{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <div className={msg.system ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-900 dark:text-gray-100'}>
                {msg.content}
              </div>
              {msg.system && <div className="text-xs text-blue-500 mt-1">System Message</div>}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSend} className="space-y-2 max-w-md">
        <textarea
          className="w-full min-h-[60px] p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100"
          placeholder="Type a group message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
        />
        <div>
          <Button type="submit" disabled={!message.trim() || loading}>
            {loading ? 'Sending...' : 'Send to Group'}
          </Button>
        </div>
        {success && <div className="text-green-600">Message sent!</div>}
      </form>
    </div>
  );
}
