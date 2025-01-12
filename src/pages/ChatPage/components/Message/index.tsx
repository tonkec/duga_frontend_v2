import { useLocalStorage } from '@uidotdev/usehooks';
import Avatar from 'react-avatar';
import { useNavigate } from 'react-router';

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
}

interface IMessageTemplateProps {
  userName: string;
  profilePhoto: string;
  message: string;
  otherUserId?: number;
  createdAt: string;
}

const messageStyles = 'py-2 px-4 rounded-full mb-2 max-w-fit text-white';

export const getMessageCreatedAt = (createdAt: string) => {
  const date = new Date(createdAt);
  const today = new Date();
  if (date.getDate() === today.getDate()) {
    return (
      <p className="text-xs text-gray-400">
        {date.getHours()}:{date.getMinutes()}
      </p>
    );
  }

  return (
    <p className="text-xs text-gray-400">
      {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}
    </p>
  );
};

const CurrentUserMessageTemplate = ({
  userName,
  profilePhoto,
  message,
  createdAt,
}: IMessageTemplateProps) => {
  return (
    <div className="flex flex-end" style={{ marginLeft: 'auto', maxWidth: 'fit-content' }}>
      <div className={messageStyles} style={{ backgroundColor: '#2D46B9' }}>
        <p>{message}</p>
        {getMessageCreatedAt(createdAt)}
      </div>
      <div style={{ marginLeft: '2px' }}>
        <Avatar name={userName} src={profilePhoto} size="24" round />
      </div>
    </div>
  );
};

const OtherUserMessageTemplate = ({
  userName,
  profilePhoto,
  message,
  otherUserId,
  createdAt,
}: IMessageTemplateProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex">
      <div
        style={{ marginRight: '2px' }}
        onClick={() => navigate(`/user/${otherUserId}`)}
        className="cursor-pointer"
      >
        <Avatar name={userName} src={profilePhoto} size="22" round />
      </div>
      <div className={messageStyles} style={{ backgroundColor: '#F037A5' }}>
        <p>{message}</p>
        {getMessageCreatedAt(createdAt)}
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
}: IMessageProps) => {
  const [currentUserId] = useLocalStorage('userId');
  const isFromCurrentUser = message.User.id === Number(currentUserId);
  return isFromCurrentUser ? (
    <CurrentUserMessageTemplate
      userName={currentUserName}
      profilePhoto={currentUserProfilePhoto}
      message={message.message}
      createdAt={message.createdAt}
    />
  ) : (
    <OtherUserMessageTemplate
      userName={otherUserName}
      profilePhoto={otherUserProfilePhoto}
      message={message.message}
      otherUserId={otherUserId}
      createdAt={message.createdAt}
    />
  );
};

export default Message;
