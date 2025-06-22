import { useLocalStorage } from '@uidotdev/usehooks';
import { useParams } from 'react-router';
import { useGetCurrentChat } from './hooks';
import ChatPage, { getOtherUser } from '.';
import { StatusProvider } from '@app/context/OnlineStatus';
import ChatGuard from './components/ChatGuard';

const ChatPageWrapper = () => {
  const [currentUserId] = useLocalStorage('userId');
  const { chatId } = useParams();
  const { currentChat } = useGetCurrentChat(chatId as string);
  const otherUserId = getOtherUser(currentChat?.data, currentUserId as string)?.userId;

  return (
    <StatusProvider otherUserId={otherUserId ?? null}>
      <ChatGuard>
        <ChatPage />
      </ChatGuard>
    </StatusProvider>
  );
};

export default ChatPageWrapper;
