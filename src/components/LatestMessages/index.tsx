import { useLocalStorage } from '@uidotdev/usehooks';
import { useGetAllUserChats } from '../../hooks/useGetAllUserChats';
import Card from '../Card';
import { useNavigate } from 'react-router';
import RecordCreatedAt from '../RecordCreatedAt';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import Avatar from 'react-avatar';
import { getProfilePhoto, getProfilePhotoUrl } from '../../utils/getProfilePhoto';
import { useGetUserById } from '../../hooks/useGetUserById';
import { S3_BUCKET_URL } from '../../utils/consts';
import { useGetIsMessageRead, useMarkMessagesAsRead } from '../../pages/NewChatPage/hooks';

interface IMessage {
  id: number;
  message: string;
  createdAt: string;
  User: {
    id: number;
    firstName: string;
  };
  chatId: number;
  messagePhotoUrl: string;
}

const groupMessagesByUser = (
  data: { Messages: IMessage[]; User: { id: number; firstName: string } }[]
) => {
  const groupedMessages = {} as IGroupedMessages;

  data.forEach((chat) => {
    chat.Messages.forEach((message) => {
      const userId = message.User.id;

      if (!groupedMessages[userId]) {
        groupedMessages[userId] = {
          user: message.User,
          messages: [],
        };
      }

      groupedMessages[userId].messages.push(message);
    });
  });

  return groupedMessages;
};

interface IGroupedMessages {
  [key: string]: { user: { id: number; firstName: string }; messages: IMessage[] };
}

const getLatestMessagesPerUser = (groupedMessages: IGroupedMessages) => {
  const latestMessages = {} as {
    [key: string]: { user: { id: number; firstName: string }; message: IMessage };
  };

  Object.entries(groupedMessages).forEach(([userId, userData]) => {
    const latestMessage = userData.messages.reduce((latest: IMessage, current: IMessage) =>
      new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
    );

    latestMessages[userId] = {
      user: userData.user,
      message: latestMessage,
    };
  });

  return latestMessages;
};

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
  const { onMarkMessagesAsRead } = useMarkMessagesAsRead();
  const { is_read } = isMessageReadData?.data || {};
  const [userId] = useLocalStorage('userId');

  const messageBackgroundColor = is_read
    ? 'bg-white text-black hover:bg-blue hover:text-white'
    : 'bg-blue text-white hover:bg-pink';

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
          <img
            src={`${S3_BUCKET_URL}/${message.messagePhotoUrl}`}
            alt="message"
            className="h-10 w-10"
          />
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
        <span> {message.message} </span> <br />
      </div>
      <RecordCreatedAt createdAt={message.createdAt} />
    </div>
  );
};

const LatestMessages = () => {
  const navigate = useNavigate();
  const numberOfChats = 4;
  const [userId] = useLocalStorage('userId');
  const { userChats } = useGetAllUserChats(String(userId), true);
  const latestChats = userChats?.data?.slice(0, numberOfChats);
  if (latestChats?.length < 3) {
    return null;
  }

  const groupedMessages = groupMessagesByUser(latestChats);
  const latestMessages = getLatestMessagesPerUser(groupedMessages);
  return (
    <div className="col-span-2">
      <h2 className="mb-2"> 📬 Tvoje nedavne poruke</h2>
      <Card className="!p-0 overflow-hidden">
        {Object.values(latestMessages).map((latestMessage, index) => (
          <LatestMessage
            key={index}
            message={latestMessage.message}
            onClick={() => navigate(`/chat/${latestMessage.message.chatId}`)}
          />
        ))}
      </Card>
    </div>
  );
};

export default LatestMessages;
