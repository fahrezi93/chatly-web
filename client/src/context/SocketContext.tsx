import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:5000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

let globalSocket: Socket | null = null;

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // If socket already exists globally, use it
    if (globalSocket && globalSocket.connected) {
      console.log('🔄 Reusing existing global socket');
      setSocket(globalSocket);
      setIsConnected(true);
      return;
    }

    // Create new socket only if none exists
    console.log('🆕 Creating new global socket connection');
    const newSocket = io(API_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    globalSocket = newSocket;
    setSocket(newSocket);

    // Cleanup only on unmount
    return () => {
      console.log('🧹 SocketProvider unmounting - keeping socket alive');
      // Don't close socket here, only when app truly closes
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
