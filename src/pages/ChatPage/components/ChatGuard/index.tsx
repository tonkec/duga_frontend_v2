import { useNavigate, useParams } from 'react-router';
import { useGetCurrentChat } from '../../hooks';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect } from 'react';

interface IChatUser {
  userId: number;
}

interface IChatGuardProps {
  children: React.ReactNode;
}

const ChatGuard = ({ children }: IChatGuardProps) => {
  const navigate = useNavigate();
  const [currentUserId] = useLocalStorage('userId');
  const { chatId } = useParams();
  const { currentChat, isCurrentChatLoading } = useGetCurrentChat(chatId as string);
  const currentChatUsersId = currentChat?.data.map((user: IChatUser) => user.userId);
  const shouldRender = currentChatUsersId?.includes(Number(currentUserId));
  console.log('shouldRender', shouldRender);
  useEffect(() => {
    if (isCurrentChatLoading) {
      return;
    }

    if (!shouldRender) {
      navigate('/404');
    }
  }, [shouldRender, navigate, isCurrentChatLoading]);

  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
};

export default ChatGuard;
