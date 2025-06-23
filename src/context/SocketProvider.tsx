import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';

const URL =
  import.meta.env.PRODUCTION || import.meta.env.STAGING
    ? 'https://dugastaging-394ccba7a9ef.herokuapp.com'
    : 'http://localhost:8080';

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
