import React, { useState } from 'react';
import { useKeyStore } from '../hooks/useKeyStore';
import { useAuthStore } from '../hooks/useAuthStore';

export default function DevPanel() {
  const keyState = useKeyStore();
  const authState = useAuthStore();
  const [log, setLog] = useState<string[]>([]);

  function simulateError() {
    setLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Simulated API error: Network unreachable`,
    ]);
  }

  function resetState() {
    keyState.clearKeys();
    authState.logout();
    setLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] State reset (keys and auth cleared)`
    ]);
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">🔧 Developer Debug Panel</h2>
      <div className="mb-6">
        <div className="font-medium mb-1">Zustand Key Store State:</div>
        <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto mb-2">{JSON.stringify(keyState, null, 2)}</pre>
        <div className="font-medium mb-1">Zustand Auth Store State:</div>
        <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto mb-2">{JSON.stringify(authState, null, 2)}</pre>
      </div>
      <div className="mb-6">
        <button
          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 mr-2"
          onClick={simulateError}
          type="button"
        >
          Simulate API Error
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600"
          onClick={resetState}
          type="button"
        >
          Reset State
        </button>
      </div>
      <div className="mb-6">
        <div className="font-medium mb-1">Logs:</div>
        <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto mb-2" style={{ minHeight: 60 }}>{log.length ? log.join('\n') : 'No logs yet.'}</pre>
      </div>
      <div className="text-xs text-gray-400">
        (Use this panel to inspect app state, simulate errors, and reset for testing.)
      </div>
    </div>
  );
}
