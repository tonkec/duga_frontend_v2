import { apiClient } from '..';

export const createChat = async (data: { userId: number; partnerId: number }) => {
  const client = apiClient();
  return client.post('/chats/create', {
    user: {
      id: data.userId,
    },
    partnerId: data.partnerId,
  });
};

export const getAllUserChats = async (userId: string) => {
  const client = apiClient();
  return client.get(`/chats`, {
    params: {
      user: {
        id: userId,
      },
    },
  });
};

export const getCurrentChat = async (chatId: string) => {
  const client = apiClient();
  return client.get(`/chats/current-chat/${chatId}`, {
    params: {
      id: chatId,
    },
  });
};
