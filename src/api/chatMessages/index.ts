import { apiClient } from '..';
import type { Message } from '../../pages/ChatPage/components/PaginatedMessages';
const API_KEY = import.meta.env.VITE_GIPHY_API_KEY;
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

export const getTrendingGIFS = async () => {
  const client = apiClient();
  const response = await client.get(
    `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=8`
  );
  return response.data.data;
};

export const getSearchGIFS = async (term: string) => {
  const client = apiClient();
  const response = await client.get(
    `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${term}&limit=8`
  );
  return response.data.data;
};
