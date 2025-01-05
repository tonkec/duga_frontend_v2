import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../api/users';

export const useGetAllUsers = () => {
  const {
    data: allUsers,
    error: allUsersError,
    isPending: isAllUsersLoading,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  return { allUsers, allUsersError, isAllUsersLoading };
};
