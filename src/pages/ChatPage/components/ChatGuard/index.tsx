import { Navigate, useParams } from 'react-router';
import { useGetCurrentChat } from '@app/pages/ChatPage/hooks';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import Loader from '@app/components/Loader';

interface IChatUser {
  userId: number;
}

interface IChatGuardProps {
  children: React.ReactNode;
}

const ChatGuard = ({ children }: IChatGuardProps) => {
  const { user: currentUser, isUserLoading } = useGetCurrentUser();
  const currentUserId = currentUser?.data?.id;
  const { chatId } = useParams();
  const { currentChat, isCurrentChatLoading, isCurrentChatError } = useGetCurrentChat(
    chatId as string
  );
  const currentChatUsersId = Array.isArray(currentChat?.data)
    ? currentChat.data.map((user: IChatUser) => user.userId)
    : [];
  const shouldRender = currentChatUsersId?.includes(Number(currentUserId));

  if (isCurrentChatLoading || isUserLoading) {
    return <Loader />;
  }

  if (isCurrentChatError || !shouldRender) {
    return <Navigate to="/new-chat" replace />;
  }

  return <>{children}</>;
};

export default ChatGuard;
