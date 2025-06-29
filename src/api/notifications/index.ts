import { apiClient } from '..';

export const getAllNotifications = async () => {
  const client = apiClient();
  return client.get(`/notifications/`);
};

export const markAsReadNotification = async (notificationId: string) => {
  const client = apiClient();
  return client.put(`/notifications/${notificationId}/read`);
};

export const markAllAsReadNotifications = async () => {
  const client = apiClient();
  return client.put(`/notifications/mark-all-read`);
};
