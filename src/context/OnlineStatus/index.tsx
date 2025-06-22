import React, { useEffect, useMemo, useState } from 'react';
import { StatusContext } from './useStatusMap';
import { useUserOnlineStatus } from './hooks';
import { useSocket } from '../useSocket';

export type StatusMap = Map<number, 'online' | 'offline'>;

export const StatusProvider = ({
  otherUserId,
  children,
}: {
  otherUserId: number | null;
  children: React.ReactNode;
}) => {
  const socket = useSocket();
  const [statusMap, setStatusMap] = useState<StatusMap>(new Map());

  const { data } = useUserOnlineStatus(String(otherUserId || ''));

  useEffect(() => {
    if (data?.status && otherUserId) {
      setStatusMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(Number(otherUserId), data.status);
        return newMap;
      });
    }
  }, [data, otherUserId]);

  console.log('StatusProvider rendered', statusMap);

  useEffect(() => {
    if (!socket || !otherUserId) return;

    socket.emit('status-update', {
      userId: Number(otherUserId),
      status: 'online',
    });

    return () => {
      socket.emit('status-update', {
        userId: Number(otherUserId),
        status: 'offline',
      });
    };
  }, [socket, otherUserId]);

  const contextValue = useMemo(() => ({ statusMap }), [statusMap]);

  return otherUserId ? (
    <StatusContext.Provider value={contextValue}>{children}</StatusContext.Provider>
  ) : (
    <>{children}</>
  );
};
