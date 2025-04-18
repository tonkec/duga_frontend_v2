import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getChatMessages } from '@app/api/chatMessages';
import { deleteCurrentChat, getCurrentChat } from '@app/api/chats';
import { toastConfig } from '@app/configs/toast.config';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

export const useGetAllMessages = (chatId: string) => {
  const {
    data,
    error: allMessagesError,
    isPending: isAllMessagesLoading,
    isSuccess: isAllMessagesSuccess,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', chatId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getChatMessages(chatId, pageParam),
    getNextPageParam: (lastPage) => {
      if (!lastPage.data.pagination) return null;
      if (lastPage.data.pagination.page < lastPage.data.pagination.totalPages) {
        return lastPage.data.pagination.page + 1;
      }
      return null;
    },
    enabled: !!chatId,
  });

  return {
    messages: data?.pages.flatMap((page) => page.data.messages).filter(Boolean) ?? [],
    allMessagesError,
    isAllMessagesLoading,
    isAllMessagesSuccess,
    fetchNextPage,
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
