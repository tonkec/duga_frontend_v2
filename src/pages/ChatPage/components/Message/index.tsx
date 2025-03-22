import { useLocalStorage } from '@uidotdev/usehooks';
import Avatar from 'react-avatar';
import { useNavigate } from 'react-router';
import RecordCreatedAt from '../../../../components/RecordCreatedAt';
import { S3_BUCKET_URL } from '../../../../utils/consts';
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
  const [src, setSrc] = useState(messagePhotoUrl);

  useEffect(() => {
    if (!messagePhotoUrl) return;
    setSrc(`${S3_BUCKET_URL}/${messagePhotoUrl}?t=${Date.now()}`);
  }, [messagePhotoUrl]);

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
}: IMessageTemplateProps) => {
  return (
    <div className="flex flex-end" style={{ marginLeft: 'auto', maxWidth: 'fit-content' }}>
      <div className="flex">
        <MessageContent messagePhotoUrl={messagePhotoUrl} message={message} createdAt={createdAt} />
      </div>
      {showAvatar ? (
        <div style={{ marginLeft: '2px' }}>
          <Avatar name={userName} src={profilePhoto} size="24" round />
        </div>
      ) : (
        <div style={{ width: '24px', height: '24px', marginLeft: '2px' }}></div>
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
      {showAvatar ? (
        <div
          style={{ marginRight: '2px' }}
          onClick={() => navigate(`/user/${otherUserId}`)}
          className="cursor-pointer"
        >
          <Avatar name={userName} src={profilePhoto} size="22" round />
        </div>
      ) : (
        <div style={{ width: '22px', height: '22px', marginRight: '2px' }}></div>
      )}
      <div className={messageStyles} style={{ backgroundColor: '#F037A5' }}>
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
