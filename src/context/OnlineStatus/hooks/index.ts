import { useQuery } from '@tanstack/react-query';
import { getUserOnlineStatus } from '../../../api/users';

export const useUserOnlineStatus = () => {
  return useQuery({
    queryKey: ['userOnlineStatus'],
    queryFn: () =>
      getUserOnlineStatus().then((res) => {
        return res.data;
      }),
    staleTime: 10 * 1000,
  });
};
