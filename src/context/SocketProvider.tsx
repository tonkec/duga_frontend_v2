import { useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';
import { useCurrentBackendUser } from '@app/hooks/useEnsureBackendUser';
import { markSessionRevoked } from '@app/api/appSession';
import { useAppSessionStatus } from './AppSessionContext';
import { setOfflineStatus } from '@app/utils/setOfflineStatus';

type CypressSocketEvent = {
  event: string;
  payload: unknown;
};

type CypressWindow = Window &
  typeof globalThis & {
    Cypress?: unknown;
    __dugaCypressE2E?: boolean;
    __dugaCypressSocketEvents?: CypressSocketEvent[];
    __dugaCypressReceiveSocketEvent?: (event: string, payload?: unknown) => void;
  };

const createCypressSocket = () => {
  const handlers = new Map<string, Set<(payload: unknown) => void>>();
  const cypressWindow = window as CypressWindow;

  cypressWindow.__dugaCypressReceiveSocketEvent = (event: string, payload?: unknown) => {
    handlers.get(event)?.forEach((handler) => handler(payload));
  };

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

const isCypressRuntime = (windowObject: CypressWindow) => {
  if (windowObject.Cypress || windowObject.__dugaCypressE2E) return true;

  try {
    const parentWindow = windowObject.parent as CypressWindow | undefined;
    return Boolean(parentWindow && parentWindow !== windowObject && parentWindow.Cypress);
  } catch {
    return false;
  }
};

const getBackendUrl = () => {
  const { hostname } = window.location;
  if (hostname.includes('staging.duga.chat')) {
    return 'https://api-staging.duga.chat';
  }
  if (hostname.includes('duga.chat') || hostname.includes('dugaprod.netlify.app')) {
    return 'https://duga-backend-c67896e8029c.herokuapp.com/';
  }
  return 'http://localhost:8080/';
};

const CypressSocketProvider = ({ children }: { children: ReactNode }) => {
  const socket = useMemo(() => createCypressSocket(), []);

  useEffect(() => {
    socket.on('session-revoked', markSessionRevoked);
    return () => {
      socket.off('session-revoked', markSessionRevoked);
    };
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

const RealSocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const appSessionStatus = useAppSessionStatus();
  const isAppSessionActive = appSessionStatus === 'active';
  const { data: currentUser, isLoading: isUserLoading } = useCurrentBackendUser({
    enabled: isAppSessionActive,
    requireAuth0: false,
  });

  useEffect(() => {
    if (!isAppSessionActive || isUserLoading || !currentUser) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }
    let newSocket: Socket | null = null;
    let didRequestOffline = false;

    const connectSocket = async () => {
      try {
        const createdSocket = io(getBackendUrl(), {
          withCredentials: true,
        });

        newSocket = createdSocket;
        socketRef.current = createdSocket;
        setSocket(createdSocket);

        createdSocket.on('connect', () => {
          createdSocket.emit('join');
        });

        createdSocket.on('connect_error', () => undefined);

        createdSocket.on('session-revoked', () => {
          markSessionRevoked();
          void setOfflineStatus(createdSocket).finally(() => createdSocket.disconnect());
        });
      } catch {
        // Socket auth is cookie-backed; avoid logging handshake details client-side.
      }
    };

    connectSocket();

    const disconnectOffline = (waitForAck: boolean) => {
      const socketToDisconnect = newSocket;
      if (!socketToDisconnect) return;
      if (didRequestOffline) {
        socketToDisconnect.disconnect();
        return;
      }

      didRequestOffline = true;
      void setOfflineStatus(socketToDisconnect, { waitForAck }).finally(() =>
        socketToDisconnect.disconnect()
      );
    };

    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) return;

      disconnectOffline(false);
    };
    const handleBeforeUnload = () => disconnectOffline(false);

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      disconnectOffline(true);
      if (socketRef.current === newSocket) {
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [isAppSessionActive, isUserLoading, currentUser]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const cypressWindow = window as CypressWindow;
  if (isCypressRuntime(cypressWindow)) {
    return <CypressSocketProvider>{children}</CypressSocketProvider>;
  }

  return <RealSocketProvider>{children}</RealSocketProvider>;
};
