import { useState, useEffect, useCallback, useRef } from "react";

export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp?: number;
}

export interface UseWebSocketOptions<T = unknown> {
  url: string;
  onMessage?: (data: T) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export interface UseWebSocketResult<T = unknown> {
  status: WebSocketStatus;
  send: (data: T) => void;
  sendJson: (type: string, payload: unknown) => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket<T = unknown>(options: UseWebSocketOptions<T>): UseWebSocketResult<T> {
  const { url, onMessage, onConnect, onDisconnect, reconnect = true, reconnectInterval = 3000, reconnectAttempts = 5 } = options;
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const attemptsRef = useRef(0);
  const connectRef = useRef(() => {});

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    setStatus("connecting");

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        attemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as T;
          onMessage?.(data);
        } catch {
          onMessage?.(event.data as T);
        }
      };

      ws.onerror = () => setStatus("error");

      ws.onclose = () => {
        setStatus("disconnected");
        onDisconnect?.();
        if (reconnect && attemptsRef.current < reconnectAttempts) {
          attemptsRef.current += 1;
          setTimeout(connectRef.current, reconnectInterval);
        }
      };
    } catch {
      setStatus("error");
    }
  }, [url, onMessage, onConnect, onDisconnect, reconnect, reconnectInterval, reconnectAttempts]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setStatus("disconnected");
  }, []);

  const send = useCallback((data: T) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data as unknown as string);
    }
  }, []);

  const sendJson = useCallback((type: string, payload: unknown) => {
    send({ type, payload, timestamp: Date.now() } as T);
  }, [send]);

  useEffect(() => {
    let didCancel = false;
    
    const initializeConnection = async () => {
      if (!didCancel) {
        connect();
      }
    };
    
    initializeConnection();
    
    return () => {
      didCancel = true;
      disconnect();
    };
  }, [connect, disconnect]);

  return { status, send, sendJson, connect, disconnect };
}

export function useBroadcastChannel<T>(channelName: string) {
  const [data, setData] = useState<T | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(channelName);
    channelRef.current.onmessage = (e) => setData(e.data);
    return () => channelRef.current?.close();
  }, [channelName]);

  const post = useCallback((data: T) => {
    channelRef.current?.postMessage(data);
  }, []);

  return { data, post };
}