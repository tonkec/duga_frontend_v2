import { useNavigate } from 'react-router';
import { IUser } from '../../../../components/UserCard';
import UserChat from '../UserChat';

interface IChat {
  id: number;
  Messages: {
    message: string;
    userId: string;
    chatId: number;
    createdAt: string;
    updatedAt: string;
  }[];
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
  return userChat.Messages[userChat.Messages.length - 1].message;
};

const AllUserChats = ({ userChats }: IAllUserChats) => {
  const navigate = useNavigate();
  return (
    <div>
      {userChats?.map((chat) => {
        return (
          <div key={chat.id}>
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
