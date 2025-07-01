import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import Card from '@app/components/Card';
import { useNavigate } from 'react-router';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import Avatar from 'react-avatar';
import { getProfilePhoto, getProfilePhotoUrl } from '@app/utils/getProfilePhoto';
import { useGetUserById } from '@app/hooks/useGetUserById';
import { S3_URL } from '@app/utils/consts';
import { IChat, useGetIsMessageRead, useMarkMessagesAsRead } from '@app/pages/NewChatPage/hooks';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';

interface IMessage {
  id: number;
  message: {
    message: string;
    createdAt: string;
  };
  createdAt: string;
  User: {
    id: number;
    firstName: string;
  };
  messagePhotoUrl: string;
  fromUserId: number;
  chatId: number;
}

const LatestMessageAvatar = ({ userId }: { userId: string }) => {
  const { allImages } = useGetAllImages(userId);
  const { user } = useGetUserById(userId);
  return (
    <div className="flex gap-2">
      <Avatar
        color="#F037A5"
        name={`${user?.data?.username}`}
        src={getProfilePhotoUrl(getProfilePhoto(allImages?.data.images))}
        size="40"
        round={true}
        className="cursor-pointer"
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

  const messageBackgroundColor = () => {
    if (isFromSameUser) {
      return 'bg-white text-black hover:bg-blue hover:text-white';
    }

    return is_read
      ? 'bg-white text-black hover:bg-blue hover:text-white'
      : 'bg-blue text-white hover:bg-pink';
  };

  const getLatestPerson = () => {
    if (message.User.id === Number(userId)) {
      return <LatestMessageAvatar userId={String(userId)} />;
    }

    return <LatestMessageAvatar userId={String(message.User.id)} />;
  };

  if (message.messagePhotoUrl) {
    return (
      <div
        onClick={() => {
          if (message.User.id !== Number(userId)) {
            onMarkMessagesAsRead(String(message.id));
          }
          onClick();
        }}
        className={`${messageBackgroundColor} cursor-pointer p-2 transition-colors duration-200 border-b border-gray-200`}
      >
        <div className="flex items-center gap-2 mb-2">
          {getLatestPerson()}
          <img src={`${S3_URL}/${message.messagePhotoUrl}`} alt="message" className="h-10 w-10" />
        </div>
        <RecordCreatedAt createdAt={message.createdAt} />
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        if (message.User.id !== Number(userId)) {
          onMarkMessagesAsRead(String(message.id));
        }
        onClick();
      }}
      className={`${messageBackgroundColor} cursor-pointer p-2 transition-colors duration-200 border-b border-gray-200`}
    >
      <div className="flex items-center gap-2 mb-2">
        {getLatestPerson()}
        <span className="text-black"> {`${message.message}`} </span> <br />
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
    .filter((m: IMessage) => m.message?.createdAt)
    .sort(
      (a: IMessage, b: IMessage) =>
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
