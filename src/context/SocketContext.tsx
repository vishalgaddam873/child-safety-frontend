'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export interface ScanAlert {
  childId: string;
  parentId: string;
  childName: string;
  log: {
    _id: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: string;
    message?: string | null;
    deviceInfo?: Record<string, string>;
  };
}

type SocketContextType = {
  connected: boolean;
  lastScan: ScanAlert | null;
  clearLastScan: () => void;
};

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastScan, setLastScan] = useState<ScanAlert | null>(null);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }
    const socket = io(WS_URL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('scan', (payload: ScanAlert) => setLastScan(payload));
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token]);

  const clearLastScan = () => setLastScan(null);

  return (
    <SocketContext.Provider value={{ connected, lastScan, clearLastScan }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
