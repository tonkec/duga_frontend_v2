import { useQuery } from '@tanstack/react-query';
import { getUserById } from '@app/api/users';

export const useGetUserById = (id: string) => {
  const {
    data: user,
    error: userError,
    isPending: isUserLoading,
  } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });

  return { user, userError, isUserLoading };
};
