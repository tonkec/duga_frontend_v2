import { useParams } from 'react-router';
import { StatusProvider } from '@app/context/OnlineStatus';
import { useGetCurrentChat } from '@app/pages/ChatPage/hooks';
import { getOtherUser } from '@app/pages/ChatPage/utils/getOtherUser';
import { useEffect, useState } from 'react';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';

type ChatUser = {
  id?: number;
  userId?: number;
};

const getChatUsers = (chatData: unknown): ChatUser[] => {
  if (Array.isArray(chatData)) return chatData;
  if (!chatData || typeof chatData !== 'object') return [];

  const chat = chatData as { Users?: ChatUser[] };
  return chat.Users ?? [];
};

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
  const otherUserFromChatId = getOtherUser(
    getChatUsers(currentChat?.data).map((user) => ({ userId: Number(user.id ?? user.userId) })),
    currentUserId as string
  )?.userId;

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
