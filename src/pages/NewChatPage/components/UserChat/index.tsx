import { BiChevronRight } from 'react-icons/bi';

interface IUserChatProps {
  user: {
    avatar: string;
    firstName: string;
    lastName: string;
    email: string;
    id: string;
  };
  onClick: () => void;
}

const UserChat = ({ user, onClick }: IUserChatProps) => {
  return (
    <div
      className="flex items-center justify-between p-4 border-b border-gray-200 bg-white cursor-pointer mb-4 mt-2"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="ml-4">
          <h1 className="text-lg font-semibold">
            {user.firstName} {user.lastName}
          </h1>
        </div>
      </div>
      <BiChevronRight className="w-6 h-6 text-gray-500" />
    </div>
  );
};

export default UserChat;
