import { useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';
import { useAuth0 } from '@auth0/auth0-react';
import AppLayout from '@app/components/AppLayout';

const getBackendUrl = () => {
  const { hostname } = window.location;
  if (hostname.includes('duga.app')) {
    return 'https://duga-backend-c67896e8029c.herokuapp.com/';
  }
  if (hostname.includes('staging--dugaprod.netlify.app')) {
    return 'https://dugastaging-394ccba7a9ef.herokuapp.com';
  }
  return 'http://localhost:8080/';
};

const URL = getBackendUrl();

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    if (!isAuthenticated) return;

    let newSocket: Socket;

    const connectSocket = async () => {
      try {
        const token = await getAccessTokenSilently();

        newSocket = io(URL, {
          auth: {
            token,
          },
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
          console.log('✅ Connected to server with socket ID:', newSocket.id);
          newSocket.emit('join');
        });

        newSocket.on('disconnect', () => {
          console.log('🔌 Disconnected from server');
        });
      } catch (err) {
        console.error('⚠️ Socket connection error:', err);
      }
    };

    connectSocket();

    return () => {
      newSocket?.disconnect();
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (isAuthenticated && !socket) {
    return (
      <AppLayout>
        <p>Učitavanje...</p>
      </AppLayout>
    );
  }

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
