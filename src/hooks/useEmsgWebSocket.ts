import { useEffect, useRef, useState } from 'react';

export type EmsgWsEvent = {
  type: string;
  payload: any;
};

export interface UseEmsgWebSocketOptions {
  token?: string; // JWT or session token for authentication
  onError?: (err: Error) => void;
  allowedTypes?: string[]; // restrict allowed event types
}

export function useEmsgWebSocket(
  url: string,
  onMessage: (event: EmsgWsEvent) => void,
  options?: UseEmsgWebSocketOptions
) {
  const wsRef = useRef(null);
  const [status, setStatus] = useState('connecting');
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: number | null = null;
    let wsUrl = url;
    if (options?.token) {
      wsUrl += (url.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(options.token);
    }
    function connect() {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      setStatus('connecting');
      ws.onopen = () => setStatus('open');
      ws.onclose = () => {
        setStatus('closed');
        // Auto-reconnect after 2s
        reconnectTimeout = setTimeout(connect, 2000);
      };
      ws.onerror = (e) => {
        setStatus('error');
        const err = new Error('WebSocket error');
        setLastError(err);
        options?.onError?.(err);
      };
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          // Strict event type validation
          if (!data || typeof data.type !== 'string') {
            throw new Error('Malformed event: missing type');
          }
          if (options?.allowedTypes && !options.allowedTypes.includes(data.type)) {
            throw new Error('Unexpected event type: ' + data.type);
          }
          onMessage(data);
        } catch (err: any) {
          setLastError(err instanceof Error ? err : new Error('Unknown error'));
          options?.onError?.(err instanceof Error ? err : new Error('Unknown error'));
        }
      };
    }
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, options?.token]);

  // Send a message through the socket
  function send(data: any) {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }

  return { status, send, lastError };
}
