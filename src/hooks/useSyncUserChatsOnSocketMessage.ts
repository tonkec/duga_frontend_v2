import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@app/context/useSocket';

/** Keeps the Poruke list in sync when messages arrive over the socket. */
export const useSyncUserChatsOnSocketMessage = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleReceived = () => {
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    };

    socket.on('received', handleReceived);

    return () => {
      socket.off('received', handleReceived);
    };
  }, [socket, queryClient]);
};
