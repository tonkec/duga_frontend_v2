import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getChatMessages } from '@app/api/chatMessages';
import { deleteCurrentChat, getCurrentChat, leaveCurrentChat } from '@app/api/chats';
import { toastConfig } from '@app/configs/toast.config';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

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
    retry: false,
    throwOnError: false,
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
    isError: isCurrentChatError,
  } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => getCurrentChat(chatId),
    enabled: !!chatId,
    retry: false,
    throwOnError: false,
  });

  return {
    currentChat,
    currentChatError,
    isCurrentChatLoading,
    isCurrentChatSuccess,
    isCurrentChatError,
  };
};

export const useDeleteCurrentChat = (socket: Socket<DefaultEventsMap, DefaultEventsMap> | null) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    mutate: deleteChat,
    isPending: isDeletingChat,
    isError: isDeleteChatError,
    isSuccess: isDeleteChatSuccess,
  } = useMutation({
    mutationFn: ({ chatId }: { chatId: string }) => deleteCurrentChat(chatId),
    onSuccess: (data, { chatId: deletedChatId }) => {
      socket?.emit('deleteChat', {
        chatId: deletedChatId,
        users: data?.data?.users ?? data?.data,
      });
      queryClient.removeQueries({ queryKey: ['chat', deletedChatId] });
      queryClient.removeQueries({ queryKey: ['messages', deletedChatId] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
      toast.success('Razgovor obrisan.', toastConfig);
      navigate('/new-chat', { replace: true });
    },
    onError: () => {
      toast.error('Greška! Probaj opet.', toastConfig);
    },
  });

  return { deleteChat, isDeletingChat, isDeleteChatError, isDeleteChatSuccess };
};

export const useLeaveCurrentChat = () => {
  const {
    mutate: leaveChat,
    isPending: isLeavingChat,
    isError: isLeaveChatError,
    isSuccess: isLeaveChatSuccess,
  } = useMutation({
    mutationFn: ({ chatId }: { chatId: string }) => leaveCurrentChat(chatId),
    onError: () => {
      toast.error('Nije moguće izaći iz razgovora. Probaj opet.', toastConfig);
    },
  });

  return { leaveChat, isLeavingChat, isLeaveChatError, isLeaveChatSuccess };
};
