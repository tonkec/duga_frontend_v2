import { useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';
import { useAuth0 } from '@auth0/auth0-react';
import { useEnsureBackendUser } from '@app/hooks/useEnsureBackendUser';
import { resolveAccessToken } from '@app/api/authToken';
import { getAppSessionId, markSessionRevoked } from '@app/api/appSession';
import { useAppSessionStatus } from './AppSessionContext';

type CypressSocketEvent = {
  event: string;
  payload: unknown;
};

type CypressWindow = Window &
  typeof globalThis & {
    Cypress?: unknown;
    __dugaCypressSocketEvents?: CypressSocketEvent[];
  };

const createCypressSocket = () => {
  const handlers = new Map<string, Set<(payload: unknown) => void>>();

  return {
    on: (event: string, handler: (payload: unknown) => void) => {
      const eventHandlers = handlers.get(event) ?? new Set();
      eventHandlers.add(handler);
      handlers.set(event, eventHandlers);
    },
    off: (event: string, handler?: (payload: unknown) => void) => {
      if (!handler) {
        handlers.delete(event);
        return;
      }

      handlers.get(event)?.delete(handler);
    },
    emit: (event: string, payload: unknown) => {
      const cypressWindow = window as CypressWindow;
      cypressWindow.__dugaCypressSocketEvents = [
        ...(cypressWindow.__dugaCypressSocketEvents ?? []),
        { event, payload },
      ];

      if (event === 'message' && payload && typeof payload === 'object') {
        handlers.get('received')?.forEach((handler) =>
          handler({
            id: Date.now(),
            createdAt: new Date().toISOString(),
            ...(payload as Record<string, unknown>),
          })
        );
      }
    },
    disconnect: () => undefined,
  } as unknown as Socket;
};

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

const CypressSocketProvider = ({ children }: { children: ReactNode }) => (
  <SocketContext.Provider value={createCypressSocket()}>{children}</SocketContext.Provider>
);

const RealSocketProvider = ({ children }: { children: ReactNode }) => {
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

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  if ((window as CypressWindow).Cypress) {
    return <CypressSocketProvider>{children}</CypressSocketProvider>;
  }

  return <RealSocketProvider>{children}</RealSocketProvider>;
};
