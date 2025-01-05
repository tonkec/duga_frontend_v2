import { useParams } from 'react-router';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import { useGetAllMessages } from './hooks';

interface IMessage {
  id: string;
  content: string;
}

const ChatPage = () => {
  const { chatId } = useParams();

  const { allMessages, isAllMessagesLoading } = useGetAllMessages(chatId as string);
  if (isAllMessagesLoading) {
    return <AppLayout>Loading...</AppLayout>;
  }

  if (!allMessages?.data.data.messages.length) {
    return (
      <AppLayout>
        <Card>
          <h1>Chat Page</h1>
          <p>Nema poruka</p>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card>
        <h1>Chat Page</h1>
        <div>
          {allMessages?.data.data.messages.map((message: IMessage) => (
            <div key={message.id}>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </AppLayout>
  );
};

export default ChatPage;
