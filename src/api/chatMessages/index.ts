import { apiClient } from '..';
import { IMessage } from '@app/pages/ChatPage/components/Message';
import { API_KEY } from '@app/utils/consts';

export const getChatMessages = async (chatId: string, page: number) => {
  const client = apiClient();
  return client.get<{
    messages: IMessage[];
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

export const getTrendingGIFS = async (page: number = 1, limit: number = 8) => {
  const client = apiClient();
  const offset = (page - 1) * limit;
  const response = await client.get(
    `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=${limit}&offset=${offset}`
  );
  return response.data.data;
};

export const getSearchGIFS = async (term: string, page: number = 1, limit: number = 8) => {
  const client = apiClient();
  const offset = (page - 1) * limit;
  const response = await client.get(
    `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${term}&limit=${limit}&offset=${offset}`
  );
  return response.data.data;
};
