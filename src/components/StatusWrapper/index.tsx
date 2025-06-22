import { useLocalStorage } from '@uidotdev/usehooks';
import { useParams } from 'react-router';
import { StatusProvider } from '@app/context/OnlineStatus';
import { useGetCurrentChat } from '@app/pages/ChatPage/hooks';
import { getOtherUser } from '@app/pages/ChatPage';

const StatusWrapper = ({
  children,
  isCurrentUser,
}: {
  children: React.ReactNode;
  isCurrentUser: boolean;
}) => {
  const [currentUserId] = useLocalStorage('userId');
  const { chatId } = useParams();
  const { currentChat } = useGetCurrentChat(chatId as string);
  const otherUserId = getOtherUser(currentChat?.data, currentUserId as string)?.userId;

  return (
    <StatusProvider onlineUserId={isCurrentUser ? Number(currentUserId) : (otherUserId ?? null)}>
      {children}
    </StatusProvider>
  );
};

export default StatusWrapper;
