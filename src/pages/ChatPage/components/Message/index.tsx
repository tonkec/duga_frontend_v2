import { useLocalStorage } from '@uidotdev/usehooks';
import Avatar from 'react-avatar';
import { useNavigate } from 'react-router';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import { S3_CHAT_PHOTO_ENVIRONMENT, S3_URL } from '@app/utils/consts';
import { useEffect, useState } from 'react';

type MessageType = 'text' | 'file' | 'gif';

interface BaseMessageTemplateProps {
  userName: string;
  profilePhoto: string;
  message: string;
  createdAt: string;
  messagePhotoUrl: string;
  showAvatar: boolean;
  messageType: MessageType;
}

export interface IMessage {
  message: string;
  createdAt: string;
  type: MessageType;
  User: {
    id: number;
  };
  id: string;
  messagePhotoUrl: string;
}

interface IMessageProps {
  message: IMessage;
  otherUserProfilePhoto: string;
  currentUserProfilePhoto: string;
  otherUserName: string;
  currentUserName: string;
  otherUserId?: number;
  messagePhotoUrl: string;
  showAvatar: boolean;
}
interface IMessageTemplateProps extends BaseMessageTemplateProps {
  otherUserId?: number;
}

interface IMessageContentProps {
  messagePhotoUrl: string;
  message: string;
  createdAt: string;
  messageType: string;
}

const messageStyles = 'p-2 rounded mb-2 text-white bg-blue flex flex-col gap-2';

const MessageContent = ({
  messagePhotoUrl,
  message,
  createdAt,
  messageType,
}: IMessageContentProps) => {
  const [src, setSrc] = useState(messagePhotoUrl);
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!messagePhotoUrl) return;
    const shouldRenderS3Image = messageType === 'file' && messagePhotoUrl;
    const shouldRenderGiphy = messageType === 'gif' && messagePhotoUrl;

    if (shouldRenderS3Image) {
      const url = `${S3_URL}/${S3_CHAT_PHOTO_ENVIRONMENT}/${encodeURIComponent(messagePhotoUrl)}`;
      timeout = setTimeout(() => setSrc(url), 1000);
    }

    if (shouldRenderGiphy) {
      setSrc(messagePhotoUrl);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [messagePhotoUrl, messageType]);

  return (
    <div className={messageStyles}>
      {src ? (
        <img
          className="cursor-pointer"
          src={src}
          alt="message"
          width={100}
          onClick={() => window.open(src, '_blank')}
          referrerPolicy="no-referrer"
        />
      ) : (
        <p>{message}</p>
      )}
      <RecordCreatedAt className="text-right" createdAt={createdAt} />
    </div>
  );
};

const CurrentUserMessageTemplate = ({
  userName,
  profilePhoto,
  message,
  createdAt,
  messagePhotoUrl,
  showAvatar,
  messageType,
}: IMessageTemplateProps) => {
  return (
    <div className={`flex flex-end ml-auto max-w-fit ${showAvatar ? 'mr-0' : 'mr-[26px]'}`}>
      <div className="flex">
        <MessageContent
          messageType={messageType}
          messagePhotoUrl={messagePhotoUrl}
          message={message}
          createdAt={createdAt}
        />
      </div>
      {showAvatar && (
        <div className="ml-0.5">
          <Avatar name={userName} src={profilePhoto} size="24" round />
        </div>
      )}
    </div>
  );
};

const OtherUserMessageTemplate = ({
  userName,
  profilePhoto,
  message,
  otherUserId,
  createdAt,
  messagePhotoUrl,
  showAvatar,
  messageType,
}: IMessageTemplateProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex">
      {showAvatar && (
        <div className="cursor-pointer mr-0.5" onClick={() => navigate(`/user/${otherUserId}`)}>
          <Avatar name={userName} src={profilePhoto} size="24" round />
        </div>
      )}
      <div className={`${messageStyles} ${!showAvatar ? 'ml-[26px]' : 'ml-0'}`}>
        <MessageContent
          messageType={messageType}
          messagePhotoUrl={messagePhotoUrl}
          message={message}
          createdAt={createdAt}
        />
      </div>
    </div>
  );
};

const Message = ({
  message,
  otherUserProfilePhoto,
  currentUserProfilePhoto,
  otherUserName,
  currentUserName,
  otherUserId,
  messagePhotoUrl,
  showAvatar,
}: IMessageProps) => {
  const [currentUserId] = useLocalStorage('userId');
  const isFromCurrentUser = message.User.id === Number(currentUserId);
  return isFromCurrentUser ? (
    <CurrentUserMessageTemplate
      userName={currentUserName}
      profilePhoto={currentUserProfilePhoto}
      message={message.message}
      createdAt={message.createdAt}
      messagePhotoUrl={messagePhotoUrl}
      showAvatar={showAvatar}
      messageType={message.type}
    />
  ) : (
    <OtherUserMessageTemplate
      userName={otherUserName}
      profilePhoto={otherUserProfilePhoto}
      message={message.message}
      otherUserId={otherUserId}
      createdAt={message.createdAt}
      messagePhotoUrl={messagePhotoUrl}
      showAvatar={showAvatar}
      messageType={message.type}
    />
  );
};

export default Message;
