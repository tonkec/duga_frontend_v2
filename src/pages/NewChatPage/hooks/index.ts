import { useMutation, useQuery } from '@tanstack/react-query';
import { createChat } from '@app/api/chats';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import { useNavigate } from 'react-router';
import { isMessageRead, markMessagesAsRead } from '@app/api/chatMessages';

interface CreateChatInput {
  userId: number;
  partnerId: number;
}

export interface IChat {
  id: number;
  type: string;
  Users: User[];
  Messages: Message[];
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  message: string;
  User: User;
  messagePhotoUrl: string;
}

export const useCreateNewChat = () => {
  const navigate = useNavigate();

  const {
    mutate: onCreateChat,
    isPending: isCreatingChat,
    isError: isCreateChatError,
    isSuccess: isCreateChatSuccess,
  } = useMutation<IChat[], unknown, CreateChatInput>({
    mutationFn: async (input: CreateChatInput) => {
      const response = await createChat(input);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Razgovor uspješno kreiran', toastConfig);
      navigate(`/chat/${data[0].id}`);
    },
    onError: (error: unknown) => {
      console.error(error);
      toast.error('Došlo je do greške.', toastConfig);
    },
  });

  return { onCreateChat, isCreatingChat, isCreateChatError, isCreateChatSuccess };
};

export const useMarkMessagesAsRead = () => {
  const {
    mutate: onMarkMessagesAsRead,
    isPending: isMarkingMessagesAsRead,
    isError: isMarkMessagesAsReadError,
    isSuccess: isMarkMessagesAsReadSuccess,
  } = useMutation<void, unknown, string>({
    mutationFn: async (messageId: string) => {
      if (!messageId) return;
      await markMessagesAsRead(messageId);
    },
    onError: (error: unknown) => {
      console.error(error);
    },
  });

  return {
    onMarkMessagesAsRead,
    isMarkingMessagesAsRead,
    isMarkMessagesAsReadError,
    isMarkMessagesAsReadSuccess,
  };
};

export const useGetIsMessageRead = (id: string) => {
  const {
    data: isMessageReadData,
    error: isMessageReadError,
    isPending: isMessageReadLoading,
  } = useQuery({
    queryKey: ['message', id],
    queryFn: () => isMessageRead(id),
    enabled: !!id,
  });

  return { isMessageReadData, isMessageReadError, isMessageReadLoading };
};
