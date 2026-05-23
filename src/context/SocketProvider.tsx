import { useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useEnsureBackendUser } from '@app/hooks/useEnsureBackendUser';
import { resolveAccessToken } from '@app/api/authToken';
import { getAppSessionId, markSessionRevoked } from '@app/api/appSession';
import { useAppSessionStatus } from './AppSessionContext';

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
  const { isAuthenticated } = useAuth0();
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const appSessionStatus = useAppSessionStatus();
  const isAppSessionActive = appSessionStatus === 'active';
  const { data: currentUser, isLoading: isUserLoading } = useEnsureBackendUser({
    enabled: isAppSessionActive,
  });

  useEffect(() => {
    if (!isAuthenticated || !isAppSessionActive || isUserLoading || !currentUser) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }
    let newSocket: Socket;

    const connectSocket = async () => {
      try {
        const token = await resolveAccessToken();
        if (!token) return;

        newSocket = io(getBackendUrl(), {
          auth: {
            token,
            sessionId: getAppSessionId(),
          },
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on('connect', () => {
          console.log('✅ Connected to socket:', newSocket.id);
          newSocket.emit('join');
        });

        newSocket.on('disconnect', () => {
          console.log('🔌 Socket disconnected');
        });

        newSocket.on('session-revoked', () => {
          markSessionRevoked();
          newSocket.disconnect();
        });
      } catch (error) {
        console.error('⚠️ Failed to connect socket:', error);
      }
    };

    connectSocket();

    return () => {
      newSocket?.disconnect();
      if (socketRef.current === newSocket) {
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [isAuthenticated, isAppSessionActive, isUserLoading, currentUser]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
