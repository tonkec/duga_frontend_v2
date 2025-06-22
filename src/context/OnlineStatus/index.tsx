import React, { useEffect, useMemo, useState } from 'react';
import { StatusContext } from './useStatusMap';
import { useUserOnlineStatus } from './hooks';
import { useSocket } from '../useSocket';

export type StatusMap = Map<number, 'online' | 'offline'>;

export const StatusProvider = ({
  onlineUserId,
  children,
}: {
  onlineUserId: number | null;
  children: React.ReactNode;
}) => {
  const socket = useSocket();
  const [statusMap, setStatusMap] = useState<StatusMap>(new Map());

  const { data } = useUserOnlineStatus(String(onlineUserId || ''));

  useEffect(() => {
    if (data?.status && onlineUserId) {
      setStatusMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(Number(onlineUserId), data.status);
        return newMap;
      });
    }
  }, [data, onlineUserId]);

  console.log('StatusProvider rendered', statusMap);

  useEffect(() => {
    if (!socket || !onlineUserId) return;

    socket.emit('status-update', {
      userId: Number(onlineUserId),
      status: 'online',
    });

    return () => {
      socket.emit('status-update', {
        userId: Number(onlineUserId),
        status: 'offline',
      });
    };
  }, [socket, onlineUserId]);

  const contextValue = useMemo(() => ({ statusMap }), [statusMap]);

  return onlineUserId ? (
    <StatusContext.Provider value={contextValue}>{children}</StatusContext.Provider>
  ) : (
    <>{children}</>
  );
};
