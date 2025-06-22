import React, { useState } from 'react';
import { useKeyStore } from '../hooks/useKeyStore';
import { wasm } from '../services/api';

export default function KeyPair() {
  const { privateKey, publicKey, setKeys, clearKeys } = useKeyStore();
  const [importValue, setImportValue] = useState('');
  const [error, setError] = useState(null);
  const [exported, setExported] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const res = await wasm.generateKeyPair();
      if (res.error) throw new Error(res.error);
      setKeys(res.privateKey, res.publicKey);
    } catch (e) {
      setError('Failed to generate key pair');
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const privHex = importValue.trim();
      if (!/^[0-9a-fA-F]{64}$/.test(privHex)) {
        setError('Private key must be 64 hex characters');
        setLoading(false);
        return;
      }
      const res = await wasm.importPrivateKey(privHex);
      if (res.error) throw new Error(res.error);
      setKeys(res.privateKey, res.publicKey);
    } catch (e) {
      setError('Invalid private key');
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">🔐 Key Pair Generator / Import</h2>
      <div className="space-y-4">
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={handleGenerate}
          type="button"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate New Key Pair'}
        </button>
        <form onSubmit={handleImport} className="space-y-2">
          <label className="block font-medium">Import Private Key (hex, 64 chars):</label>
          <input
            className="w-full p-2 border rounded dark:bg-gray-800 dark:text-gray-100"
            value={importValue}
            onChange={e => setImportValue(e.target.value)}
            placeholder="Paste your 64-char hex private key"
            maxLength={64}
            spellCheck={false}
            disabled={loading}
          />
          <button
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Import Key'}
          </button>
        </form>
        {privateKey && publicKey && (
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
            <div className="mb-2">
              <span className="font-semibold">Public Key:</span>
              <div className="break-all text-blue-700 dark:text-blue-300 text-xs">{publicKey}</div>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Private Key:</span>
              <div className="break-all text-red-700 dark:text-red-300 text-xs">{privateKey}</div>
            </div>
            <button
              className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 mr-2"
              onClick={() => {
                navigator.clipboard.writeText(privateKey);
                handleExport();
              }}
              type="button"
            >
              Export/Copy Private Key
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
              onClick={clearKeys}
              type="button"
            >
              Remove Key
            </button>
            {exported && <span className="ml-2 text-green-600">Copied!</span>}
          </div>
        )}
        {error && <div className="text-red-600">{error}</div>}
      </div>
    </div>
  );
}
