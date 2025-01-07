import { useQuery } from '@tanstack/react-query';
import { getAllUserChats } from '../api/chats';

export const useGetAllUserChats = (userId: string) => {
  const {
    data: userChats,
    error: userChatsError,
    isPending: isUserChatsLoading,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getAllUserChats(userId),
  });

  return { userChats, userChatsError, isUserChatsLoading };
};
