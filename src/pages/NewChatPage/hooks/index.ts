import { useMutation, useQuery } from '@tanstack/react-query';
import { createChat, CreateChatInput } from '@app/api/chats';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import { useNavigate } from 'react-router';
import { isMessageRead, markMessagesAsRead } from '@app/api/chatMessages';
import { MessageType } from '@app/pages/ChatPage/components/Message';

export interface IChat {
  id: number;
  type: string;
  name?: string;
  Users: User[];
  Messages: Message[];
}

export interface User {
  id: number;
  publicId?: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  username?: string;
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  User: User;
  messagePhotoUrl: string;
  fromUserId: number;
  chatId: number;
  message: string;
  securePhotoUrl: string;
  type: MessageType;
}

export const useCreateNewChat = () => {
  const navigate = useNavigate();

  const {
    mutate: onCreateChat,
    isPending: isCreatingChat,
    isError: isCreateChatError,
    isSuccess: isCreateChatSuccess,
  } = useMutation<IChat | IChat[], unknown, CreateChatInput>({
    mutationFn: async (input: CreateChatInput) => {
      const response = await createChat(input);
      return response.data;
    },
    onSuccess: (data) => {
      const createdChat = Array.isArray(data) ? data[0] : data;

      toast.success('Razgovor uspješno kreiran', toastConfig);
      navigate(`/chat/${createdChat.id}`);
    },
    onError: () => {
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
    onError: () => undefined,
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
