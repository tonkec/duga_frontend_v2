import { useQuery } from '@tanstack/react-query';
import { getUserOnlineStatus } from '../../../api/users';

export const useUserOnlineStatus = (userId: string) => {
  return useQuery({
    queryKey: ['userOnlineStatus', userId],
    queryFn: () => getUserOnlineStatus(userId).then((res) => res.data),
    enabled: !!userId,
    staleTime: 10 * 1000,
  });
};
