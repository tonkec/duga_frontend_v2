import { apiClient } from '..';

export const getAllNotifications = async (userId: string) => {
  const client = apiClient();
  return client.get(`/notifications/${userId}`);
};
