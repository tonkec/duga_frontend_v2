import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@app/api/users';

export const useGetAllUsers = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const {
    data: allUsers,
    error: allUsersError,
    isLoading: isAllUsersLoading,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => getAllUsers(),
    enabled,
    retry: false,
    refetchOnMount: false,
    staleTime: 1000 * 60,
  });

  return { allUsers, allUsersError, isAllUsersLoading };
};
