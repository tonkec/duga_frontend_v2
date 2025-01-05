import { apiClient } from '..';

export const createChat = async (data: { userId: string; partnerId: string }) => {
  const client = apiClient();
  return client.post('/chats/create', data);
};
