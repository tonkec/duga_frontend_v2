import { apiClient } from '..';

export const getAllNotifications = async (userId: string) => {
  const client = apiClient();
  return client.get(`/notifications/${userId}`);
};

export const markAsReadNotification = async (notificationId: string) => {
  const client = apiClient();
  return client.put(`/notifications/${notificationId}/read`);
};

export const markAllAsReadNotifications = async (userId: string) => {
  const client = apiClient();
  return client.put(`/notifications/mark-all-read`, {
    userId,
  });
};
