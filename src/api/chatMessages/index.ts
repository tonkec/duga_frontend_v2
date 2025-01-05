import { apiClient } from '..';

export const getChatMessages = async (chatId: string) => {
  const client = apiClient();
  return client.get(`/chats/messages/`, {
    params: {
      id: chatId,
    },
  });
};
