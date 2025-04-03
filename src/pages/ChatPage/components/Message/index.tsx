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
    type: string;
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
  messageType: string;
}

const messageStyles = 'p-2 rounded mb-2 text-white bg-blue flex flex-col gap-2';

interface IMessageContentProps {
  messagePhotoUrl: string;
  message: string;
  createdAt: string;
  messageType: string;
}

const MessageContent = ({
  messagePhotoUrl,
  message,
  createdAt,
  messageType,
}: IMessageContentProps) => {
  const [src, setSrc] = useState(messagePhotoUrl);
  useEffect(() => {
    if (!messagePhotoUrl) return;
    const shouldRenderS3Image = messageType === 'file' && messagePhotoUrl;
    const shouldRenderGiphy = messageType === 'gif' && messagePhotoUrl;

    if (shouldRenderS3Image) {
      setSrc(`${S3_URL}/${S3_CHAT_PHOTO_ENVIRONMENT}/${messagePhotoUrl}`);
    }

    if (shouldRenderGiphy) {
      setSrc(messagePhotoUrl);
    }
  }, [messagePhotoUrl, messageType]);

  if (src) {
    return (
      <div className={messageStyles}>
        <img
          className="cursor-pointer"
          src={src}
          alt="message"
          width={100}
          onClick={() => {
            window.open(src, '_blank');
          }}
        />
        <RecordCreatedAt className="text-right" createdAt={createdAt} />
      </div>
    );
  }

  return (
    <div className={messageStyles}>
      <p>{message}</p>
      <RecordCreatedAt createdAt={createdAt} />
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
