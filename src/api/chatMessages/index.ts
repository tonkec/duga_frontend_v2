import { apiClient } from '..';
import { IMessage } from '@app/pages/ChatPage/components/Message';
import { API_KEY } from '@app/utils/consts';
import axios from 'axios';

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
    skipGlobalErrorHandler: true,
  });
};

export const markMessagesAsRead = async (messageId: string) => {
  const client = apiClient();
  return client.post(
    `/messages/read-message/`,
    {
      id: messageId,
    },
    {
      skipGlobalErrorHandler: true,
    }
  );
};

export const isMessageRead = async (messageId: string) => {
  const client = apiClient();
  return client.get(`/messages/is-read/`, {
    params: {
      id: messageId,
    },
    skipGlobalErrorHandler: true,
  });
};

export const getTrendingGIFS = async (page: number = 1, limit: number = 8) => {
  const offset = (page - 1) * limit;
  const response = await axios.get(
    `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=${limit}&offset=${offset}`
  );
  return response.data.data;
};

export const getSearchGIFS = async (term: string, page: number = 1, limit: number = 8) => {
  const offset = (page - 1) * limit;
  const response = await axios.get(
    `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${term}&limit=${limit}&offset=${offset}`
  );
  return response.data.data;
};
