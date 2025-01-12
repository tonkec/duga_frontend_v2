import { useLocalStorage } from '@uidotdev/usehooks';
import { useGetAllUserChats } from '../../hooks/useGetAllUserChats';
import Card from '../Card';
import { getMessageCreatedAt } from '../../pages/ChatPage/components/Message';
import { IChat } from '../../pages/NewChatPage/hooks';
import { useNavigate } from 'react-router';

interface IMessage {
  id: number;
  message: string;
  createdAt: string;
  User: {
    id: number;
    firstName: string;
  };
}

const LatestMessage = ({ message, onClick }: { message: IMessage; onClick: () => void }) => {
  const [userId] = useLocalStorage('userId');
  const getLatestPerson = () => {
    if (message.User.id === Number(userId)) {
      return 'Od tebe';
    }

    return `Od ${message.User.firstName}`;
  };
  return (
    <div onClick={onClick}>
      <p>
        <span> {message.message} </span> <br />
        <span className="text-gray-500 text-sm inline-block mt-2">{getLatestPerson()}</span>
      </p>
      <p className="text-sm text-gray-500">{getMessageCreatedAt(message.createdAt)}</p>
    </div>
  );
};

const LatestMessages = () => {
  const navigate = useNavigate();
  const numberOfChats = 4;
  const [userId] = useLocalStorage('userId');
  const { userChats } = useGetAllUserChats(userId as string, true);
  const latestChats = userChats?.data?.slice(0, numberOfChats);
  return (
    <div>
      <h2 className="mb-2"> 📬 Tvoje nedavne poruke</h2>
      <Card className="p-0 overflow-hidden">
        {latestChats?.map((chat: IChat) =>
          chat.Messages.map((message: IMessage) => (
            <div className="flex flex-col gap-1 border-b p-4 hover:bg-blue hover:text-white transition cursor-pointer">
              <p>Razgovor sa {chat.Users[0].firstName} </p>
              <LatestMessage
                message={message}
                onClick={() => {
                  navigate(`/chat/${chat.id}`);
                }}
              />
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default LatestMessages;
