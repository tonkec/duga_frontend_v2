import { useQuery, useMutation } from '@tanstack/react-query';
import { getAllNotifications, markAsReadNotification } from '@app/api/notifications';

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

  return { allNotifications, allNotificationsError, areAllNotificationsLoading };
};

export const useMarkAsReadNotification = () => {
  const {
    mutate: mutateMarkAsRead,
    isPending: isMarkingAsRead,
    isError: isMarkAsReadError,
    isSuccess: isMarkAsReadSuccess,
  } = useMutation({
    mutationFn: (notificationId: string) => markAsReadNotification(notificationId),
  });

  return {
    mutateMarkAsRead,
    isMarkingAsRead,
    isMarkAsReadError,
    isMarkAsReadSuccess,
  };
};
