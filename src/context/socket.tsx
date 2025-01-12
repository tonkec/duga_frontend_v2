import { useLocalStorage } from '@uidotdev/usehooks';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Type the socket context
type SocketType = Socket | null;

const URL =
  process.env.NODE_ENV === 'production'
    ? 'https://duga-backend.herokuapp.com'
    : 'http://localhost:8080';

// Create Socket Context
const SocketContext = createContext<SocketType>(null);
const socket: Socket = io(URL);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [currentUserId] = useLocalStorage('userId');
  const [, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Handle connection and disconnection
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Connected to server with socket ID:', socket.id);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    };

    // Attach event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Emit join event when user ID is available
    if (currentUserId) {
      socket.emit('join', { id: currentUserId });
    }

    // Cleanup event listeners on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.emit('leave', { id: currentUserId }); // Optional: emit a leave event
    };
  }, [currentUserId]);

  // Provide the socket instance via context
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

// Custom hook to consume the Socket Context
export const useSocket = (): Socket => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
