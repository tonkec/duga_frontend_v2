import { apiClient } from '..';

export const getAllNotifications = async () => {
  const client = apiClient();
  return client.get(`/notifications/`, {
    skipGlobalErrorHandler: true,
  });
};

export const markAsReadNotification = async (notificationId: string) => {
  const client = apiClient();
  return client.put(`/notifications/${notificationId}/read`, undefined, {
    skipGlobalErrorHandler: true,
  });
};

export const markAllAsReadNotifications = async () => {
  const client = apiClient();
  return client.put(`/notifications/mark-all-read`, undefined, {
    skipGlobalErrorHandler: true,
  });
};
