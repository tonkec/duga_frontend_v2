import { useNavigate } from 'react-router';
import { IUser } from '../../../../components/UserCard';
import UserChat from '../UserChat';

interface IChat {
  id: number;
  Messages: string[];
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
            />
          </div>
        );
      })}
    </div>
  );
};

export default AllUserChats;
