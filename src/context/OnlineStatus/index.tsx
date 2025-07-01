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

  const { data } = useUserOnlineStatus();
  useEffect(() => {
    if (data?.status && onlineUserId) {
      setStatusMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(Number(onlineUserId), data.status);
        return newMap;
      });
    }
  }, [data, onlineUserId]);

  useEffect(() => {
    if (socket && onlineUserId) {
      socket.on('status-update', (userId: number, status: 'online' | 'offline') => {
        setStatusMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(userId, status);
          return newMap;
        });
      });

      return () => {
        socket.off('status-update');
      };
    }
  }, [socket, onlineUserId]);

  const contextValue = useMemo(() => ({ statusMap }), [statusMap]);

  return onlineUserId ? (
    <StatusContext.Provider value={contextValue}>{children}</StatusContext.Provider>
  ) : (
    <>{children}</>
  );
};
