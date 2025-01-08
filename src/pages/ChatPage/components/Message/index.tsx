import { useLocalStorage } from '@uidotdev/usehooks';
import Avatar from 'react-avatar';
import { useNavigate } from 'react-router';

interface IMessageProps {
  message: {
    message: string;
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
}

const CurrentUserMessageTemplate = ({ userName, profilePhoto, message }: IMessageTemplateProps) => {
  return (
    <div className="flex flex-end" style={{ marginLeft: 'auto', maxWidth: 'fit-content' }}>
      <div
        className="py-2 px-4 rounded-full mb-2 max-w-[200px] text-white"
        style={{ backgroundColor: '#2D46B9' }}
      >
        <p>{message}</p>
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
      <div
        className="py-2 px-4 rounded-full mb-2 max-w-[200px] text-white"
        style={{ backgroundColor: '#F037A5' }}
      >
        <p>{message}</p>
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
    />
  ) : (
    <OtherUserMessageTemplate
      userName={otherUserName}
      profilePhoto={otherUserProfilePhoto}
      message={message.message}
      otherUserId={otherUserId}
    />
  );
};

export default Message;
