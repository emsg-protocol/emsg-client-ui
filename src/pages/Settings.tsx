import React, { useState } from 'react';
import { useKeyStore } from '../hooks/useKeyStore';

export default function Settings() {
  const { privateKey, publicKey } = useKeyStore();
  const [domain, setDomain] = useState(() => localStorage.getItem('emsg_domain') || 'emsg');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleCopyKey() {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleSaveDomain(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem('emsg_domain', domain);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">⚙️ Settings Panel</h2>
      <form onSubmit={handleSaveDomain} className="mb-6">
        <label className="block font-medium mb-1">Domain:</label>
        <input
          className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100 mb-2"
          value={domain}
          onChange={e => setDomain(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          type="submit"
        >
          Save Domain
        </button>
        {saved && <span className="ml-2 text-green-600">Saved!</span>}
      </form>
      <div className="mb-6">
        <div className="font-medium mb-1">Public Key:</div>
        <div className="break-all text-blue-700 dark:text-blue-300 text-xs mb-2">{publicKey || <span className="text-gray-400">No key loaded</span>}</div>
        <div className="font-medium mb-1">Private Key:</div>
        <div className="break-all text-red-700 dark:text-red-300 text-xs mb-2">{privateKey || <span className="text-gray-400">No key loaded</span>}</div>
        <button
          className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
          onClick={handleCopyKey}
          type="button"
          disabled={!privateKey}
        >
          Export/Copy Private Key
        </button>
        {copied && <span className="ml-2 text-green-600">Copied!</span>}
      </div>
      <div className="text-xs text-gray-400">
        (Keep your private key secure. Anyone with your private key can access your messages.)
      </div>
    </div>
  );
}
