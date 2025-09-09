import { BiChevronRight } from 'react-icons/bi';
import { useGetIsMessageRead, useMarkMessagesAsRead } from '@app/pages/NewChatPage/hooks';
import { useLocalStorage } from '@uidotdev/usehooks';
import LastMessage from '../LastMessage';
import { IMessage } from '@app/pages/ChatPage/components/Message';
import { IUser } from '@app/components/UserCard';
import UserAvatar from '@app/components/UserAvatar';

interface IUserChatProps {
  user: IUser;
  onClick: () => void;
  lastMessage: IMessage | null;
}

const UserChat = ({ user, onClick, lastMessage }: IUserChatProps) => {
  const [userId] = useLocalStorage('userId');
  const { onMarkMessagesAsRead } = useMarkMessagesAsRead();
  const { isMessageReadData } = useGetIsMessageRead(String(lastMessage?.id || ''));
  const { is_read } = isMessageReadData?.data || {};

  const isMarkedAsRead = () => {
    if (!lastMessage) return true;
    if (lastMessage?.fromUserId === Number(userId)) return true;

    return is_read;
  };

  return (
    <div
      className={`flex rounded items-center justify-between p-4 border-b border-gray-200 cursor-pointer mb-4 mt-2 ${isMarkedAsRead() ? 'bg-white text-black' : 'bg-blue text-white'}`}
      onClick={() => {
        if (!lastMessage) {
          onClick();
          return;
        }
        if (lastMessage?.fromUserId !== Number(userId)) {
          onMarkMessagesAsRead(String(lastMessage?.id) || '');
        }
        onClick();
      }}
    >
      <div className="flex flex-col items-center">
        {lastMessage && (
          <div className="ml-4">
            <LastMessage message={lastMessage} />
          </div>
        )}
        <div className="flex mt-4 items-center">
          <UserAvatar
            color="#2D46B9"
            avatarFallbackName={`${user.username}`}
            userId={String(user.id)}
          />
          <div className="ml-4">
            <h1 className="text-lg font-semibold">{user.username}</h1>
          </div>
        </div>
      </div>
      <BiChevronRight
        className="w-6 h-6 text-gray-500"
        color={isMarkedAsRead() ? '#000' : '#fff'}
      />
    </div>
  );
};

export default UserChat;
