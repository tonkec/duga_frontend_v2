import { useQuery } from '@tanstack/react-query';
import { getUserByUsername } from '../../../api/users';

export const useGetUserByUsername = (username: string) => {
  const {
    data: userData,
    error: userError,
    isPending: isUserLoading,
  } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserByUsername(username),
    enabled: !!username,
  });

  return { userData, userError, isUserLoading };
};
