import { useGetIsMessageRead, useMarkMessagesAsRead } from '@app/pages/NewChatPage/hooks';
import LastMessage from '../LastMessage';
import { IMessage } from '@app/pages/ChatPage/components/Message';
import { IUser } from '@app/components/UserCard';
import UserAvatar from '@app/components/UserAvatar';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';

interface IUserChatProps {
  user: IUser;
  onClick: () => void;
  lastMessage: IMessage | null;
}

const UserChat = ({ user, onClick, lastMessage }: IUserChatProps) => {
  const { user: currentUser, isUserLoading } = useGetCurrentUser();
  const userId = currentUser?.data?.id;
  const { onMarkMessagesAsRead } = useMarkMessagesAsRead();
  const { isMessageReadData } = useGetIsMessageRead(String(lastMessage?.id || ''));
  const { is_read } = isMessageReadData?.data || {};

  const isMarkedAsRead = () => {
    if (!lastMessage) return true;
    if (userId == null) return true;
    if (lastMessage?.fromUserId === Number(userId)) return true;
    return is_read;
  };

  if (isUserLoading) {
    return null;
  }

  return (
    <div
      className={`flex-1 flex rounded items-center justify-between px-4 py-2 cursor-pointer mb-4 mt-2 border bg-[#f7f9ff] border-[#dce4ff] ${isMarkedAsRead() ? 'text-black hover:bg-[#e0e7ff]' : 'bg-blue text-white'}`}
      onClick={() => {
        if (!lastMessage) {
          onClick();
          return;
        }
        if (userId != null && lastMessage?.fromUserId !== Number(userId)) {
          onMarkMessagesAsRead(String(lastMessage?.id) || '');
        }
        onClick();
      }}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <UserAvatar
            color="#F037A5"
            avatarFallbackName={`${user.username}`}
            userId={String(user.id)}
            className="w-[40px] h-[40px] rounded-full"
          />
          <div className="ml-4">
            <h1 className="text-lg font-semibold">{user.username}</h1>
          </div>
        </div>
        {lastMessage && (
          <div>
            <LastMessage message={lastMessage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChat;
