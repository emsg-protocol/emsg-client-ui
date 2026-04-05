// src/hooks/useWasmStatus.ts
// Polls window.__emsgWasmReady and window.__emsgWasmError every 500ms.

import { useEffect, useState } from 'react';

export interface WasmStatus {
  ready: boolean;
  error: string | null;
  retry: () => void;
}

export function useWasmStatus(): WasmStatus {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready || error) return;

    const interval = setInterval(() => {
      const wasmError = (window as any).__emsgWasmError as string | undefined;
      if (wasmError) {
        setError(wasmError);
        clearInterval(interval);
        return;
      }
      if ((window as any).__emsgWasmReady === true) {
        setReady(true);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [ready, error]);

  function retry() {
    window.location.reload();
  }

  return { ready, error, retry };
}
