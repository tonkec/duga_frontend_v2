import { apiClient } from '..';

export const createChat = async (data: { partnerId: number }) => {
  const client = apiClient();
  return client.post('/chats/create', {
    partnerId: data.partnerId,
  });
};

export const getAllUserChats = async () => {
  const client = apiClient();
  return client.get(`/chats`);
};

export const getCurrentChat = async (chatId: string) => {
  const client = apiClient();
  return client.get(`/chats/current-chat/${chatId}`, {
    params: {
      id: chatId,
    },
  });
};

export const deleteCurrentChat = async (chatId: string) => {
  const client = apiClient();
  return client.delete(`/chats/${chatId}`);
};
