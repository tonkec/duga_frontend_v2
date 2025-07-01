import { useQuery } from '@tanstack/react-query';
import { getAllUserChats } from '@app/api/chats';

export const useGetAllUserChats = (isQueryEnabled?: boolean) => {
  const {
    data: userChats,
    error: userChatsError,
    isPending: isUserChatsLoading,
  } = useQuery({
    queryKey: ['userChats'],
    queryFn: () => getAllUserChats(),
    enabled: isQueryEnabled,
  });

  return { userChats, userChatsError, isUserChatsLoading };
};
