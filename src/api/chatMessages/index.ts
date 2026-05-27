import { apiClient } from '..';
import { IMessage, MessageType } from '@app/pages/ChatPage/components/Message';
import { API_KEY } from '@app/utils/consts';
import axios from 'axios';

const GIPHY_API_BASE_URL = 'https://api.giphy.com/v1/gifs';
const GIPHY_CONTENT_RATING = 'pg-13';
const GIPHY_BUNDLE = 'messaging_non_clips';

const buildGiphyUrl = (
  endpoint: 'trending' | 'search',
  params: Record<string, string | number>
) => {
  const searchParams = new URLSearchParams({
    api_key: API_KEY ?? '',
    rating: GIPHY_CONTENT_RATING,
    bundle: GIPHY_BUNDLE,
  });

  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });

  return `${GIPHY_API_BASE_URL}/${endpoint}?${searchParams.toString()}`;
};

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

export const sendChatMessage = async (data: {
  chatId: number;
  message?: string | null;
  type: MessageType;
  messagePhotoUrl?: string;
  securePhotoUrl?: string;
  mentions?: number[];
}) => {
  const client = apiClient();
  return client.post('/messages', data);
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
  const response = await axios.get(buildGiphyUrl('trending', { limit, offset }));
  return response.data.data;
};

export const getSearchGIFS = async (term: string, page: number = 1, limit: number = 8) => {
  const offset = (page - 1) * limit;
  const response = await axios.get(buildGiphyUrl('search', { q: term, limit, offset }));
  return response.data.data;
};
