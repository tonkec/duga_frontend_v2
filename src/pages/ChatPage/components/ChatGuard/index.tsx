import { useNavigate, useParams } from 'react-router';
import { useGetCurrentChat } from '@app/pages/ChatPage/hooks';
import { useEffect } from 'react';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';

interface IChatUser {
  userId: number;
}

interface IChatGuardProps {
  children: React.ReactNode;
}

const ChatGuard = ({ children }: IChatGuardProps) => {
  const navigate = useNavigate();
  const { user: currentUser, isUserLoading } = useGetCurrentUser();
  const currentUserId = currentUser?.data?.id;
  const { chatId } = useParams();
  const { currentChat, isCurrentChatLoading } = useGetCurrentChat(chatId as string);
  const currentChatUsersId = currentChat?.data.map((user: IChatUser) => user.userId);
  const shouldRender = currentChatUsersId?.includes(Number(currentUserId));
  useEffect(() => {
    if (isCurrentChatLoading || isUserLoading) {
      return;
    }

    if (!shouldRender) {
      navigate('/new-chat', { replace: true });
    }
  }, [shouldRender, navigate, isCurrentChatLoading, isUserLoading]);

  if (isCurrentChatLoading || isUserLoading) {
    return null;
  }

  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
};

export default ChatGuard;
