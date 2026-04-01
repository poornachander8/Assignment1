import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);

  useEffect(() => {
    if (!token) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    // Re-authenticate on every connection/reconnection
    const authenticate = () => {
      socket.emit('authenticate', token);
    };

    socket.on('connect', authenticate);
    socket.on('reconnect', authenticate);

    socket.on('new_notification', (payload) => {
      setUnreadCount((prev) => prev + 1);
      setLatestNotification(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const resetUnreadCount = () => setUnreadCount(0);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, unreadCount, latestNotification, resetUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
