import React, { useState } from 'react';
import { Button } from '../components/Button';
import { useKeyStore } from '../hooks/useKeyStore';
import { wasm } from '../services/api';

export default function ComposeMessage() {
  const { privateKey, publicKey } = useKeyStore();
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      if (!privateKey || !publicKey) {
        setError('You must generate or import a key pair first.');
        setLoading(false);
        return;
      }
      // Initialize WASM client with private key
      const initRes = await wasm.initClient(privateKey);
      if ((initRes as any).error) throw new Error((initRes as any).error);
      // Send message
      const sendRes = await wasm.sendMessage(publicKey, to, message);
      if (sendRes.error) throw new Error(sendRes.error);
      setSuccess(true);
      setMessage('');
    } catch (e: any) {
      setError(e.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">✉️ Compose Message</h2>
      <form onSubmit={handleSubmit} className="space-y-4 w-full" aria-label="Compose Message Form">
        <label className="block font-medium" htmlFor="to-input">To (e.g. bob#domain.com):</label>
        <input
          id="to-input"
          className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring"
          placeholder="To (e.g. bob#domain.com)"
          value={to}
          onChange={e => setTo(e.target.value)}
          required
          aria-label="Recipient address"
        />
        <label className="block font-medium" htmlFor="msg-input">Message:</label>
        <textarea
          id="msg-input"
          className="w-full min-h-[100px] p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring"
          placeholder="Type your message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          aria-label="Message body"
        />
        <div>
          <Button type="submit" disabled={!message.trim() || !to.trim() || loading} aria-label="Send Message">
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
        {success && <div className="text-green-600" role="status">Message sent!</div>}
        {error && <div className="text-red-600" role="alert">{error}</div>}
      </form>
    </div>
  );
}
