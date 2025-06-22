import { useEffect, useRef, useState } from 'react';

export type EmsgWsEvent = {
  type: string;
  payload: any;
};

export function useEmsgWebSocket(
  url: string,
  onMessage: (event: EmsgWsEvent) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    function connect() {
      ws = new WebSocket(url);
      wsRef.current = ws;
      setStatus('connecting');
      ws.onopen = () => setStatus('open');
      ws.onclose = () => {
        setStatus('closed');
        // Auto-reconnect after 2s
        reconnectTimeout = setTimeout(connect, 2000);
      };
      ws.onerror = () => setStatus('error');
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          onMessage(data);
        } catch {}
      };
    }
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Send a message through the socket
  function send(data: any) {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }

  return { status, send };
}
