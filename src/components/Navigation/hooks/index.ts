import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllNotifications, markAsReadNotification } from '@app/api/notifications';
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
  const userId = useLocalStorage('userId')[0];
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
        queryKey: ['notifications', userId],
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
