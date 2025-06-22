import React, { useState } from 'react';
import { useKeyStore } from '../hooks/useKeyStore';
import { wasm } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { setKeys } = useKeyStore();
  const [privKey, setPrivKey] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!/^[0-9a-fA-F]{64}$/.test(privKey.trim())) {
        setError('Private key must be 64 hex characters');
        setLoading(false);
        return;
      }
      const res = await wasm.importPrivateKey(privKey.trim());
      if (res.error) throw new Error(res.error);
      setKeys(res.privateKey, res.publicKey);
      navigate('/');
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">🔐 Login with Private Key</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-gray-100"
          value={privKey}
          onChange={e => setPrivKey(e.target.value)}
          placeholder="Paste your 64-char hex private key"
          maxLength={64}
          spellCheck={false}
          disabled={loading}
        />
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          type="submit"
          disabled={loading || !privKey.trim()}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
}
