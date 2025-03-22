import { useQuery } from '@tanstack/react-query';
import { getAllNotifications } from '../../../api/notifications';

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
