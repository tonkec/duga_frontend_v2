import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@app/context/useSocket';
import { useGetCurrentUser } from './useGetCurrentUser';
import {
  removeStoredChatMember,
  removeStoredChatMembers,
  removeStoredGroupChatAdmin,
  setStoredGroupChatAdmin,
} from '@app/utils/chatMemberStorage';

/** Keeps the Poruke list in sync when message previews change over the socket. */
export const useSyncUserChatsOnSocketMessage = () => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const { user: currentUser } = useGetCurrentUser();
  const currentUserId = currentUser?.data?.id;

  useEffect(() => {
    if (!socket) return;

    const refreshUserChats = () => {
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    };
    const handleRemoveUserFromChat = ({
      chatId,
      userId,
      currentUserId: eventCurrentUserId,
      newAdminUserId,
    }: {
      chatId: number | string;
      userId: number;
      currentUserId?: number;
      newAdminUserId?: number;
    }) => {
      if (Number(eventCurrentUserId ?? userId) === Number(currentUserId)) {
        removeStoredChatMembers(String(chatId));
        removeStoredGroupChatAdmin(String(chatId));
      } else {
        removeStoredChatMember(String(chatId), Number(userId));
        if (newAdminUserId !== undefined) {
          setStoredGroupChatAdmin(String(chatId), Number(newAdminUserId));
        }
      }
      refreshUserChats();
    };

    socket.on('received', refreshUserChats);
    socket.on('message-reaction-updated', refreshUserChats);
    socket.on('remove-user-from-chat', handleRemoveUserFromChat);

    return () => {
      socket.off('received', refreshUserChats);
      socket.off('message-reaction-updated', refreshUserChats);
      socket.off('remove-user-from-chat', handleRemoveUserFromChat);
    };
  }, [socket, queryClient, currentUserId]);
};
