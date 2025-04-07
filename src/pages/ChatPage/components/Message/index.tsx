import { useLocalStorage } from '@uidotdev/usehooks';
import Avatar from 'react-avatar';
import { useNavigate } from 'react-router';
import RecordCreatedAt from '../../../../components/RecordCreatedAt';
import { S3_CHAT_PHOTO_ENVIRONMENT, S3_URL } from '../../../../utils/consts';
import { useEffect, useState } from 'react';

interface IMessageProps {
  message: {
    message: string;
    createdAt: string;
    User: {
      id: number;
    };
  };
  otherUserProfilePhoto: string;
  currentUserProfilePhoto: string;
  otherUserName: string;
  currentUserName: string;
  otherUserId: number | undefined;
  messagePhotoUrl: string;
  showAvatar: boolean;
}

interface IMessageTemplateProps {
  userName: string;
  profilePhoto: string;
  message: string;
  otherUserId?: number;
  createdAt: string;
  messagePhotoUrl: string;
  showAvatar: boolean;
}

const messageStyles = 'p-2 rounded mb-2 text-white bg-blue flex flex-col gap-2';

interface IMessageContentProps {
  messagePhotoUrl: string;
  message: string;
  createdAt: string;
}

const MessageContent = ({ messagePhotoUrl, message, createdAt }: IMessageContentProps) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!messagePhotoUrl) return;

    const url = `${S3_URL}/${S3_CHAT_PHOTO_ENVIRONMENT}/${encodeURI(messagePhotoUrl)}`;
    const timeout = setTimeout(() => setSrc(url), 1000);

    return () => clearTimeout(timeout);
  }, [messagePhotoUrl]);

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
}: IMessageTemplateProps) => {
  return (
    <div className={`flex flex-end ml-auto max-w-fit ${showAvatar ? 'mr-0' : 'mr-[26px]'}`}>
      <div className="flex">
        <MessageContent messagePhotoUrl={messagePhotoUrl} message={message} createdAt={createdAt} />
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
        <MessageContent messagePhotoUrl={messagePhotoUrl} message={message} createdAt={createdAt} />
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
    />
  );
};

export default Message;
