import { useQuery } from '@tanstack/react-query';
import { getUserById } from '../api/users';

export const useGetUserById = (id: string) => {
  const {
    data: user,
    error: userError,
    isPending: isUserLoading,
  } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
  });

  return { user, userError, isUserLoading };
};
