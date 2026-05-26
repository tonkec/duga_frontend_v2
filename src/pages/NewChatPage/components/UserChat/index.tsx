import clsx from 'clsx';
import { useGetIsMessageRead, useMarkMessagesAsRead } from '@app/pages/NewChatPage/hooks';
import LastMessage from '../LastMessage';
import { IMessage } from '@app/pages/ChatPage/components/Message';
import { IUser } from '@app/components/UserCard';
import UserAvatar from '@app/components/UserAvatar';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import RecordCreatedAt from '@app/components/RecordCreatedAt';

interface IUserChatProps {
  user: IUser;
  onClick: () => void;
  lastMessage: IMessage | null;
  isFirst?: boolean;
  isLast?: boolean;
}

const UserChat = ({ user, onClick, lastMessage, isFirst, isLast }: IUserChatProps) => {
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

  const isUnread = !isMarkedAsRead();

  const handleClick = () => {
    if (!lastMessage) {
      onClick();
      return;
    }
    if (userId != null && lastMessage?.fromUserId !== Number(userId)) {
      onMarkMessagesAsRead(String(lastMessage?.id) || '');
    }
    onClick();
  };

  if (isUserLoading) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        'user-chat-item group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors duration-150',
        'hover:bg-[#eef3ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue',
        isUnread && 'bg-[#f7f9ff]',
        isFirst && 'rounded-t-xl',
        isLast && 'rounded-b-xl'
      )}
    >
      <div
        className={clsx(
          'relative shrink-0',
          isUnread && 'ring-2 ring-blue/30 ring-offset-2 rounded-full'
        )}
      >
        <UserAvatar
          color="#eef3ff"
          fgColor="#2D46B9"
          avatarFallbackName={user.username}
          userId={String(user.id)}
          className="h-12 w-12 rounded-full border border-[#dce4ff]"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className={clsx(
              'truncate text-base',
              isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
            )}
          >
            {user.username}
          </span>
          {lastMessage && (
            <RecordCreatedAt
              createdAt={lastMessage.createdAt}
              className={clsx('shrink-0 whitespace-nowrap', isUnread && '!text-blue !font-medium')}
            />
          )}
        </div>

        <div className="mt-0.5 flex items-center gap-2">
          {lastMessage ? (
            <LastMessage message={lastMessage} isUnread={isUnread} />
          ) : (
            <span className="text-sm italic text-gray-400">Još nema poruka</span>
          )}
          {isUnread && (
            <span
              className="ml-auto h-2.5 w-2.5 shrink-0 rounded-full bg-blue"
              aria-label="Nepročitana poruka"
            />
          )}
        </div>
      </div>
    </button>
  );
};

export default UserChat;
