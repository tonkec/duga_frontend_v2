import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllNotifications,
  markAllAsReadNotifications,
  markAsReadNotification,
} from '@app/api/notifications';

export const useGetAllNotifcations = () => {
  const {
    data: allNotifications,
    error: allNotificationsError,
    isPending: areAllNotificationsLoading,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getAllNotifications(),
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
  const queryClient = useQueryClient();
  const {
    mutate: mutateMarkAllAsRead,
    isPending: isMarkingAllAsRead,
    isError: isMarkAllAsReadError,
    isSuccess: isMarkAllAsReadSuccess,
  } = useMutation({
    mutationFn: () => markAllAsReadNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
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
