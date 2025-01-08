import { useQuery } from '@tanstack/react-query';
import { getChatMessages } from '../../../api/chatMessages';
import { getCurrentChat } from '../../../api/chats';

export const useGetAllMessages = (chatId: string) => {
  const {
    data: allMessages,
    error: allMessagesError,
    isPending: isAllMessagesLoading,
    isSuccess: isAllMessagesSuccess,
  } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => getChatMessages(chatId),
  });

  return { allMessages, allMessagesError, isAllMessagesLoading, isAllMessagesSuccess };
};

export const useGetCurrentChat = (chatId: string) => {
  const {
    data: currentChat,
    error: currentChatError,
    isPending: isCurrentChatLoading,
    isSuccess: isCurrentChatSuccess,
  } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => getCurrentChat(chatId),
  });

  return { currentChat, currentChatError, isCurrentChatLoading, isCurrentChatSuccess };
};
