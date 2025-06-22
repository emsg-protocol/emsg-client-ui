import React, { useState } from 'react';
import { useKeyStore } from '../hooks/useKeyStore';
import { useMessageStore } from '../hooks/useMessageStore';

export default function DevPanel() {
  const keyState = useKeyStore();
  const messageState = useMessageStore();
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function simulateError() {
    setError('Simulated error for testing!');
    setLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Simulated API error: Network unreachable`,
    ]);
    setTimeout(() => setError(null), 2000);
  }

  function resetState() {
    keyState.clearKeys();
    setLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] State reset (keys cleared)`
    ]);
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">🔧 Developer Debug Panel</h2>
      <div className="mb-4">
        <button
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 mr-2"
          onClick={simulateError}
        >
          Simulate Error
        </button>
        <button
          className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
          onClick={resetState}
          type="button"
        >
          Reset State
        </button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Key Store State</h3>
        <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(keyState, null, 2)}</pre>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Message Store State</h3>
        <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(messageState, null, 2)}</pre>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Logs</h3>
        <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto" style={{ minHeight: 60 }}>{log.length ? log.join('\n') : 'No logs yet.'}</pre>
      </div>
      <div>
        <h3 className="font-semibold mb-1">Environment</h3>
        <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">{JSON.stringify({ NODE_ENV: import.meta.env.MODE, VITE_API_MODE: import.meta.env.VITE_API_MODE }, null, 2)}</pre>
      </div>
      <div className="text-xs text-gray-400 mt-4">
        (Use this panel to inspect app state, simulate errors, and reset for testing.)
      </div>
    </div>
  );
}
