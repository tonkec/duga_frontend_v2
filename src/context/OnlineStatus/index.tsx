import React, { useEffect, useMemo, useState } from 'react';
import { useSocket } from './../useSocket';
import { StatusContext } from './useStatusMap';
import { useUserOnlineStatus } from './hooks';
import { useLocalStorage } from '@uidotdev/usehooks';

export type StatusMap = Map<number, 'online' | 'offline'>;

export const StatusProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useSocket();
  const [statusMap, setStatusMap] = useState<StatusMap>(new Map());
  const [userId] = useLocalStorage('userId');

  const { data } = useUserOnlineStatus(String(userId || ''));

  useEffect(() => {
    if (data?.status && userId) {
      setStatusMap((prev) => new Map(prev.set(Number(userId), data.status)));
    }
  }, [data, userId]);

  useEffect(() => {
    if (!socket) return;

    const handler = ({ userId, status }: { userId: number; status: 'online' | 'offline' }) => {
      setStatusMap((prev) => new Map(prev.set(userId, status)));
    };

    socket.on('status-update', handler);
    return () => {
      socket.off('status-update', handler);
    };
  }, [socket]);

  const contextValue = useMemo(() => ({ statusMap }), [statusMap]);

  return userId ? (
    <StatusContext.Provider value={contextValue}>{children}</StatusContext.Provider>
  ) : (
    <>{children}</>
  );
};
