import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import Card from '@app/components/Card';
import { useNavigate } from 'react-router';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import { useGetUserById } from '@app/hooks/useGetUserById';
import { IChat, useGetIsMessageRead, useMarkMessagesAsRead } from '@app/pages/NewChatPage/hooks';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import BlobImage from '../PhotoUploader/components/BlobImage';
import UserAvatar from '../UserAvatar';
import GiphyMessage from '@app/pages/ChatPage/components/GiphyMessage';
import { IMessage } from '@app/pages/ChatPage/components/Message';
import ContentFormatter from '../ContentFormatter';

interface IMessageWrapper {
  message: IMessage;
}

const LatestMessageAvatar = ({ userId }: { userId: string }) => {
  const { user } = useGetUserById(userId);
  return (
    <div className="flex gap-2">
      <UserAvatar
        className="w-6 h-6"
        color="#F037A5"
        avatarFallbackName={`${user?.data?.username}`}
        userId={userId}
      />
    </div>
  );
};

const LatestMessage = ({ message, onClick }: { message: IMessage; onClick: () => void }) => {
  const { isMessageReadData } = useGetIsMessageRead(String(message?.id) || '');
  const { user: currentUser } = useGetCurrentUser();
  const userId = currentUser?.data?.id;

  const { onMarkMessagesAsRead } = useMarkMessagesAsRead();
  const { is_read } = isMessageReadData?.data || {};
  const isFromSameUser = message.User.id === Number(userId);

  const handleClick = () => {
    if (!isFromSameUser) {
      onMarkMessagesAsRead(String(message.id));
    }
    onClick();
  };

  const messageBackgroundColor = isFromSameUser
    ? 'bg-white text-black hover:bg-blue hover:text-white'
    : is_read
      ? 'bg-white text-black hover:bg-blue hover:text-white'
      : 'bg-blue text-white hover:bg-pink';

  const getLatestPerson = () => (
    <LatestMessageAvatar userId={String(isFromSameUser ? userId : message.User.id)} />
  );

  const renderMessageContent = () => {
    if (message.type === 'gif') {
      return <GiphyMessage messagePhotoUrl={message.messagePhotoUrl} />;
    }

    if (message.securePhotoUrl) {
      return <BlobImage imageUrl={message.securePhotoUrl} name="komentar" className="w-32 h-32" />;
    }

    return (
      <span className="text-black">
        <ContentFormatter text={message.message} />
      </span>
    );
  };

  return (
    <div
      onClick={handleClick}
      className={`${messageBackgroundColor} cursor-pointer p-2 transition-colors duration-200 border-b border-gray-200`}
    >
      <div className="flex items-center gap-2 mb-2">
        {getLatestPerson()}
        {renderMessageContent()}
      </div>
      <RecordCreatedAt createdAt={message.createdAt} />
    </div>
  );
};

const LatestMessages = () => {
  const navigate = useNavigate();
  const { userChats } = useGetAllUserChats(true);

  if (!userChats?.data?.length) return null;

  const allMessages = userChats.data.flatMap((chat: IChat) => {
    return chat.Messages.map((message: IMessage) => {
      const sender = chat.Users.find((u) => u.id === message.fromUserId);
      return { message, user: sender };
    });
  });

  const sorted = allMessages
    .filter((m: IMessageWrapper) => m.message?.createdAt)
    .sort(
      (a: IMessageWrapper, b: IMessageWrapper) =>
        new Date(b.message.createdAt).getTime() - new Date(a.message.createdAt).getTime()
    );
  const top3 = sorted.slice(0, 3);

  return (
    <div className="col-span-2">
      <h2 className="mb-2">📬 Tvoje nedavne poruke</h2>
      <Card className="!p-0 overflow-hidden">
        {top3.map(({ message }: { message: IMessage }, index: number) => (
          <LatestMessage
            key={index}
            message={message}
            onClick={() => navigate(`/chat/${message.chatId}`)}
          />
        ))}
      </Card>
    </div>
  );
};

export default LatestMessages;
