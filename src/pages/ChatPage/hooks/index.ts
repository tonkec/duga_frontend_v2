import { useQuery } from '@tanstack/react-query';
import { getChatMessages } from '../../../api/chatMessages';

export const useGetAllMessages = (chatId: string) => {
  const {
    data: allMessages,
    error: allMessagesError,
    isPending: isAllMessagesLoading,
    isSuccess: isAllMessagesSuccess,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => getChatMessages(chatId),
  });

  return { allMessages, allMessagesError, isAllMessagesLoading, isAllMessagesSuccess };
};
