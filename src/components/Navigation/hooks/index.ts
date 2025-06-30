import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllNotifications,
  markAllAsReadNotifications,
  markAsReadNotification,
} from '@app/api/notifications';
import { useLocalStorage } from '@uidotdev/usehooks';

export const useGetAllNotifcations = (userId: string) => {
  const {
    data: allNotifications,
    error: allNotificationsError,
    isPending: areAllNotificationsLoading,
  } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getAllNotifications(userId),
    enabled: !!userId,
  });

  return {
    allNotifications,
    allNotificationsError,
    areAllNotificationsLoading,
  };
};

export const useMarkAsReadNotification = () => {
  const queryClient = useQueryClient();
  const {
    mutate: mutateMarkAsRead,
    isPending: isMarkingAsRead,
    isError: isMarkAsReadError,
    isSuccess: isMarkAsReadSuccess,
  } = useMutation({
    mutationFn: (notificationId: string) => markAsReadNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });
    },
  });

  return {
    mutateMarkAsRead,
    isMarkingAsRead,
    isMarkAsReadError,
    isMarkAsReadSuccess,
  };
};

export const useMarkAllAsReadNotifications = () => {
  const [userId] = useLocalStorage('userId');
  const queryClient = useQueryClient();
  const {
    mutate: mutateMarkAllAsRead,
    isPending: isMarkingAllAsRead,
    isError: isMarkAllAsReadError,
    isSuccess: isMarkAllAsReadSuccess,
  } = useMutation({
    mutationFn: () => markAllAsReadNotifications(String(userId)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', userId],
      });
    },
  });

  return {
    mutateMarkAllAsRead,
    isMarkingAllAsRead,
    isMarkAllAsReadError,
    isMarkAllAsReadSuccess,
  };
};
