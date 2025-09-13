import { useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useEnsureBackendUser } from '@app/hooks/useEnsureBackendUser';
import { useLocalStorage } from '@uidotdev/usehooks';

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

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [, saveUserId] = useLocalStorage('userId');
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: currentUser, isLoading: isUserLoading } = useEnsureBackendUser();

  useEffect(() => {
    if (!isAuthenticated || isUserLoading || !currentUser) return;
    saveUserId(currentUser?.id);
    let newSocket: Socket;

    const connectSocket = async () => {
      try {
        const token = await getAccessTokenSilently();

        newSocket = io(getBackendUrl(), {
          auth: {
            token,
          },
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
          console.log('✅ Connected to socket:', newSocket.id);
          newSocket.emit('join');
        });

        newSocket.on('disconnect', () => {
          console.log('🔌 Socket disconnected');
        });
      } catch (error) {
        console.error('⚠️ Failed to connect socket:', error);
      }
    };

    connectSocket();

    return () => {
      newSocket?.disconnect();
    };
  }, [isAuthenticated, isUserLoading, currentUser, getAccessTokenSilently]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (isAuthenticated && !socket) {
    return null;
  }

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
