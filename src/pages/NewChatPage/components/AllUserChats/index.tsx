import { useNavigate } from 'react-router';
import { IUser } from '@app/components/UserCard';
import UserChat from '@app/pages/NewChatPage/components/UserChat';
import { IMessage } from '@app/pages/ChatPage/components/Message';

interface IChat {
  id: number;
  Messages: IMessage[];
  Users: IUser[];
  createdAt: string;
  type: string;
  ChatUser: {
    userId: string;
    chatId: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface IAllUserChats {
  userChats: IChat[];
}

const getLastMessage = (userChat: IChat) => {
  if (userChat.Messages.length === 0) {
    return null;
  }

  return userChat.Messages.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })[0];
};

const AllUserChats = ({ userChats }: IAllUserChats) => {
  const navigate = useNavigate();
  return (
    <div>
      <h2 className="mb-2">Svi razgovori</h2>
      {userChats?.map((chat) => {
        return (
          <div key={chat.id} className="flex items-center justify-center">
            <UserChat
              user={chat.Users[0]}
              onClick={() => {
                navigate(`/chat/${chat.id}`);
              }}
              lastMessage={getLastMessage(chat)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default AllUserChats;
