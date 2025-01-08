import { useParams } from 'react-router';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import SendMessage from './components/SendMessage';
import { useEffect, useMemo, useState } from 'react';
import { socket } from '../../socket';
import { useLocalStorage } from '@uidotdev/usehooks';
import ChatGuard from './components/ChatGuard';
import PaginatedMessages from './components/PaginatedMessages';
import { useGetCurrentChat } from './hooks';
import { useGetUserById } from '../../hooks/useGetUserById';

interface IMessage {
  id: string;
  message: string;
  createdAt: string;
  User: {
    id: number;
  };
}

interface IChatUser {
  userId: number;
}

const getOtherUser = (chatUsers: IChatUser[], currentUserId: string) => {
  return chatUsers.find((user) => user.userId !== Number(currentUserId));
};

const ChatPage = () => {
  const [currentUserId] = useLocalStorage('userId');
  const { chatId } = useParams();
  const [receivedMessages, setReceivedMessages] = useState<IMessage[]>([]);
  const { currentChat, isCurrentChatLoading } = useGetCurrentChat(chatId as string);

  const otherUserId = useMemo(() => {
    if (!currentChat || isCurrentChatLoading) return null;
    return getOtherUser(currentChat.data, currentUserId as string)?.userId;
  }, [currentChat, currentUserId, isCurrentChatLoading]);
  const { user: otherUser } = useGetUserById(String(otherUserId || ''));

  const chatTitle = useMemo(() => {
    if (!otherUser) return '';
    return `${otherUser.data.firstName} ${otherUser.data.lastName}`;
  }, [otherUser]);

  useEffect(() => {
    socket.on('received', (data: IMessage) => {
      setReceivedMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('received');
    };
  }, []);

  return (
    <ChatGuard>
      <AppLayout>
        <Card>
          <h1>{chatTitle}</h1>
          <div className="mt-4">
            <PaginatedMessages />
            {receivedMessages.map((message: IMessage) => (
              <div
                className="bg-gray-200 py-2 px-4 rounded-full mb-2 max-w-[200px] text-white"
                key={message.id}
                style={{
                  marginLeft: message.User.id === Number(currentUserId) ? 'auto' : '0',
                  backgroundColor:
                    message.User.id === Number(currentUserId) ? '#2D46B9' : '#F037A5',
                }}
              >
                <p>{message.message}</p>
              </div>
            ))}
          </div>
          <SendMessage chatId={chatId} />
        </Card>
      </AppLayout>
    </ChatGuard>
  );
};

export default ChatPage;
