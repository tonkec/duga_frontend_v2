import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@app/api/users';

export const useGetCurrentUser = () => {
  const {
    data: user,
    error: userError,
    isPending: isUserLoading,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
  });

  return { user, userError, isUserLoading };
};
