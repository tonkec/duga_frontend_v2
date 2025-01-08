import { useParams } from 'react-router';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import { useGetAllMessages } from './hooks';
import Loader from '../../components/Loader';
import SendMessage from './components/SendMessage';
import { useEffect, useState } from 'react';
import { socket } from '../../socket';
import { useLocalStorage } from '@uidotdev/usehooks';
import ChatGuard from './components/ChatGuard';

interface IMessage {
  id: string;
  message: string;
  createdAt: string;
  User: {
    id: number;
  };
}

const ChatPage = () => {
  const [currentUserId] = useLocalStorage('userId');
  const { chatId } = useParams();
  const { allMessages, isAllMessagesLoading } = useGetAllMessages(chatId as string);
  const descendingMessages = allMessages?.data?.messages?.sort((a: IMessage, b: IMessage) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const [receivedMessages, setReceivedMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    socket.on('received', (data: IMessage) => {
      setReceivedMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('received');
    };
  }, []);

  if (isAllMessagesLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  if (!allMessages?.data?.messages?.length) {
    return (
      <AppLayout>
        <Card>
          <h1>Chat Page</h1>
          <p>Nema poruka</p>
          <SendMessage chatId={chatId} />
        </Card>
      </AppLayout>
    );
  }

  return (
    <ChatGuard>
      <AppLayout>
        <Card>
          <h1>Chat Page</h1>
          <div className="mt-4">
            {descendingMessages?.map((message: IMessage) => (
              <div
                className="bg-pink text-white py-2 px-4 rounded-full mb-2 max-w-[200px]"
                style={{
                  marginLeft: message.User.id === Number(currentUserId) ? 'auto' : '0',
                  backgroundColor: message.User.id === 4 ? '#2D46B9' : '#F037A5',
                }}
                key={message.id}
              >
                <p>{message.message}</p>
              </div>
            ))}
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
