import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@app/context/useSocket';
import { clearLegacyChatMemberStorage } from '@app/utils/chatMemberStorage';

/** Keeps the Poruke list in sync when message previews change over the socket. */
export const useSyncUserChatsOnSocketMessage = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    clearLegacyChatMemberStorage();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const refreshUserChats = () => {
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    };

    socket.on('received', refreshUserChats);
    socket.on('message-reaction-updated', refreshUserChats);
    socket.on('remove-user-from-chat', refreshUserChats);

    return () => {
      socket.off('received', refreshUserChats);
      socket.off('message-reaction-updated', refreshUserChats);
      socket.off('remove-user-from-chat', refreshUserChats);
    };
  }, [socket, queryClient]);
};
