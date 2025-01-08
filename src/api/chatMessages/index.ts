import { apiClient } from '..';

export const getChatMessages = async (chatId: string, page: number) => {
  const client = apiClient();
  return client.get(`/chats/messages/`, {
    params: {
      id: chatId,
      page,
    },
  });
};
