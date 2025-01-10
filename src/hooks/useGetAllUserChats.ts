import { useQuery } from '@tanstack/react-query';
import { getAllUserChats } from '../api/chats';

export const useGetAllUserChats = (userId: string, isQueryEnabled?: boolean) => {
  const {
    data: userChats,
    error: userChatsError,
    isPending: isUserChatsLoading,
  } = useQuery({
    queryKey: ['userChats', userId],
    queryFn: () => getAllUserChats(userId),
    enabled: isQueryEnabled,
  });

  return { userChats, userChatsError, isUserChatsLoading };
};
