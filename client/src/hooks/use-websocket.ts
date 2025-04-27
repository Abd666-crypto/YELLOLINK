import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketHookOptions {
  userType: 'rider' | 'driver';
  userId: number;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

type SendMessageFunction = (data: any) => void;

export function useWebSocket({
  userType,
  userId,
  onMessage,
  onConnect,
  onDisconnect,
  onError
}: WebSocketHookOptions): {
  connected: boolean;
  connecting: boolean;
  sendMessage: SendMessageFunction;
} {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    // Close any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Determine WebSocket URL (adjusting for protocol)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Create new WebSocket connection
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    // Handle connection open
    socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
      setConnected(true);
      setConnecting(false);
      
      // Register connection with user type and ID
      socket.send(JSON.stringify({
        type: 'register',
        userType,
        userId
      }));
      
      if (onConnect) onConnect();
    });

    // Handle incoming messages
    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        if (onMessage) onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Handle connection close
    socket.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      setConnected(false);
      setConnecting(false);
      if (onDisconnect) onDisconnect();
    });

    // Handle errors
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      setConnecting(false);
      if (onError) onError(error);
    });

    // Clean up on unmount
    return () => {
      console.log('Closing WebSocket connection');
      socket.close();
    };
  }, [userType, userId, onMessage, onConnect, onDisconnect, onError]);

  // Function to send messages
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, message not sent');
    }
  }, []);

  return { connected, connecting, sendMessage };
}