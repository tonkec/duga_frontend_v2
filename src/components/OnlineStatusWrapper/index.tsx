import { useParams } from 'react-router';
import { StatusProvider } from '@app/context/OnlineStatus';
import { useGetCurrentChat } from '@app/pages/ChatPage/hooks';
import { getOtherUser } from '@app/pages/ChatPage';
import { useEffect, useState } from 'react';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';

const OnlineStatusWrapper = ({
  children,
  isCurrentUser = false,
}: {
  children: React.ReactNode;
  isCurrentUser?: boolean;
}) => {
  const [otherUserId, setOtherUserId] = useState<number | null>(null);
  const { user: currentUser } = useGetCurrentUser();
  const currentUserId = currentUser?.data?.id;
  const { chatId } = useParams();
  const { userId } = useParams();
  const { currentChat } = useGetCurrentChat(chatId as string);
  const otherUserFromChatId = getOtherUser(currentChat?.data, currentUserId as string)?.userId;

  useEffect(() => {
    if (isCurrentUser) {
      setOtherUserId(null);
    } else if (userId) {
      setOtherUserId(Number(userId));
    } else if (otherUserFromChatId) {
      setOtherUserId(otherUserFromChatId);
    }
  }, [isCurrentUser, userId, otherUserFromChatId, currentUserId]);

  return (
    <StatusProvider onlineUserId={isCurrentUser ? Number(currentUserId) : (otherUserId ?? null)}>
      {children}
    </StatusProvider>
  );
};

export default OnlineStatusWrapper;
