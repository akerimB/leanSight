import { useEffect, useRef, useState } from 'react';

interface RealTimeUpdate {
  type: string;
  data?: any;
  timestamp: string;
}

interface UseRealTimeUpdatesOptions {
  onUpdate?: (update: RealTimeUpdate) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoReconnect?: boolean;
}

export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<RealTimeUpdate | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const clientIdRef = useRef<string>(`client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    onUpdate,
    onConnect,
    onDisconnect,
    autoReconnect = true
  } = options;

  const connect = () => {
    if (eventSourceRef.current) {
      return; // Already connected
    }

    try {
      const url = `/api/analytics/stream?clientId=${clientIdRef.current}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('Real-time connection established');
        setIsConnected(true);
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const update: RealTimeUpdate = JSON.parse(event.data);
          setLastUpdate(update);
          onUpdate?.(update);
        } catch (error) {
          console.error('Failed to parse real-time update:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Real-time connection error:', error);
        setIsConnected(false);
        eventSource.close();
        eventSourceRef.current = null;
        onDisconnect?.();

        // Auto-reconnect if enabled
        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000); // Retry after 5 seconds
        }
      };

      // Handle page visibility changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Page is hidden, close connection to save resources
          disconnect();
        } else {
          // Page is visible again, reconnect
          if (autoReconnect && !eventSourceRef.current) {
            connect();
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      onDisconnect?.();
    }
  };

  const sendUpdate = async (data: any) => {
    try {
      await fetch('/api/analytics/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to send real-time update:', error);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    lastUpdate,
    connect,
    disconnect,
    sendUpdate
  };
} 