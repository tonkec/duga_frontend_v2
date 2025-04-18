import { useNavigate } from 'react-router';
import { IUser } from '@app/components/UserCard';
import UserChat from '@app/pages/NewChatPage/components/UserChat';

interface IChat {
  id: number;
  Messages: {
    message: string;
    fromUserId: number;
    chatId: number;
    createdAt: string;
    updatedAt: string;
    id: string;
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
