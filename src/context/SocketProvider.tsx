import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';

const getBackendUrl = () => {
  const { hostname } = window.location;
  if (hostname.includes('duga.app')) {
    return 'https://duga-backend-c67896e8029c.herokuapp.com/';
  }
  if (hostname.includes('staging--dugaprod.netlify.app')) {
    return 'https://duga-staging-backend-394ccba7a9ef.herokuapp.com/';
  }
  return 'http://localhost:8080/';
};
const URL = getBackendUrl();

const socket: Socket = io(URL);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [currentUserId] = useLocalStorage('userId');
  const [, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Connected to server with socket ID:', socket.id);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (currentUserId) {
      socket.emit('join', { id: currentUserId });
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [currentUserId]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
