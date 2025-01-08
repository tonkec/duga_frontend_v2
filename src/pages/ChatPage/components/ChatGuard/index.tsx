import { useNavigate, useParams } from 'react-router';
import { useGetCurrentChat } from '../../hooks';
import { useLocalStorage } from '@uidotdev/usehooks';

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
  const { currentChat } = useGetCurrentChat(chatId as string);
  const currentChatUsersId = currentChat?.data.map((user: IChatUser) => user.userId);
  const shouldRender = currentChatUsersId?.includes(Number(currentUserId));

  if (!shouldRender) {
    return navigate('/404');
  }

  return <>{children}</>;
};

export default ChatGuard;
