import { useMutation, useQuery } from '@tanstack/react-query';
import { getChatMessages } from '../../../api/chatMessages';
import { deleteCurrentChat, getCurrentChat } from '../../../api/chats';
import { toastConfig } from '../../../configs/toast.config';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

export const useGetAllMessages = (chatId: string, page: number) => {
  const {
    data: allMessages,
    error: allMessagesError,
    isPending: isAllMessagesLoading,
    isSuccess: isAllMessagesSuccess,
    refetch: refetchAllMessages,
  } = useQuery({
    queryKey: ['messages', chatId, page],
    queryFn: () => getChatMessages(chatId, page),
    enabled: !!chatId,
  });

  return {
    refetchAllMessages,
    allMessages,
    allMessagesError,
    isAllMessagesLoading,
    isAllMessagesSuccess,
  };
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
    enabled: !!chatId,
  });

  return { currentChat, currentChatError, isCurrentChatLoading, isCurrentChatSuccess };
};

export const useDeleteCurrentChat = () => {
  const navigate = useNavigate();
  const {
    mutate: deleteChat,
    isPending: isDeletingChat,
    isError: isDeleteChatError,
    isSuccess: isDeleteChatSuccess,
  } = useMutation({
    mutationFn: ({ chatId }: { chatId: string }) => deleteCurrentChat(chatId),
    onSuccess: () => {
      toast.success('Chat izbrisan!', toastConfig);
      navigate('/new-chat');
    },
    onError: () => {
      toast.error('Greška! Probaj opet.', toastConfig);
    },
  });

  return { deleteChat, isDeletingChat, isDeleteChatError, isDeleteChatSuccess };
};
