import { apiClient } from '..';
import type { Message } from '../../pages/ChatPage/components/PaginatedMessages';

export const getChatMessages = async (chatId: string, page: number) => {
  const client = apiClient();
  return client.get<{
    messages: Message[];
    pagination?: {
      page: number;
      totalPages: number;
    };
  }>(`/chats/messages/`, {
    params: {
      id: chatId,
      page,
    },
  });
};

export const markMessagesAsRead = async (messageId: string) => {
  const client = apiClient();
  return client.post(`/messages/read-message/`, {
    id: messageId,
  });
};

export const isMessageRead = async (messageId: string) => {
  const client = apiClient();
  return client.get(`/messages/is-read/`, {
    params: {
      id: messageId,
    },
  });
};
