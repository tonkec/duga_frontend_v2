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
      const handleStatusUpdate = (userId: number, status: 'online' | 'offline') => {
        if (Number(userId) !== Number(onlineUserId)) return;

        setStatusMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(userId, status);
          return newMap;
        });
      };

      socket.on('status-update', handleStatusUpdate);

      return () => {
        socket.off('status-update', handleStatusUpdate);
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
