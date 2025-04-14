import React, { useEffect, useMemo, useState } from 'react';
import { useSocket } from './../useSocket';
import { StatusContext } from './useStatusMap';

export type StatusMap = Map<number, 'online' | 'offline'>;

export const StatusProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useSocket();
  const [statusMap, setStatusMap] = useState<StatusMap>(new Map());

  useEffect(() => {
    if (!socket) return;

    socket.on('status-update', ({ userId, status }) => {
      setStatusMap((prev) => new Map(prev.set(userId, status)));
    });

    return () => {
      socket.off('status-update');
    };
  }, [socket]);

  const contextValue = useMemo(() => ({ statusMap }), [statusMap]);

  return <StatusContext.Provider value={contextValue}>{children}</StatusContext.Provider>;
};
