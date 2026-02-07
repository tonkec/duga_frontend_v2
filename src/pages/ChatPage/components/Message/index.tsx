import { useNavigate } from 'react-router';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import UserAvatar from '@app/components/UserAvatar';
import GiphyMessage from '../GiphyMessage';
import ContentFormatter from '@app/components/ContentFormatter';
import Image from '@app/components/Image';

export type MessageType = 'text' | 'file' | 'gif';

interface BaseMessageTemplateProps {
  userName: string;
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
  id: number;
  securePhotoUrl: string;
  fromUserId: number;
  messagePhotoUrl: string;
  chatId: number;
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
  currentUserId: number;
  isCurrentUserLoading: boolean;
}

interface OtherUserMessageTemplateProps extends BaseMessageTemplateProps {
  otherUserId?: number;
}

interface CurrentUserMessageTemplateProps extends BaseMessageTemplateProps {
  currentUserId: number;
  isCurrentUserLoading: boolean;
}

interface IMessageContentProps {
  messagePhotoUrl: string;
  message: string;
  createdAt: string;
  messageType: string;
}

const messageStyles = 'p-2 rounded mb-2 text-white flex flex-col gap-2 max-w-[50vw]';

const unwrapUploadsProxy = (url?: string) => {
  if (!url) return '';
  const prefix = '/uploads/files/';
  return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : url;
};

const MessageContent = ({
  messagePhotoUrl,
  message,
  createdAt,
  messageType,
}: IMessageContentProps) => {
  const isS3File = messageType === 'file';
  const isGiphy = messageType === 'gif';

  // For GIFs, use the unwrapped external URL directly
  const externalGifUrl = isGiphy ? unwrapUploadsProxy(messagePhotoUrl || '') : '';

  // Only fetch blobs for S3 files through your API
  const proxiedUrl = !isGiphy && isS3File ? messagePhotoUrl || '' : '';
  const { data: imageBlob, error } = useGetImageBlob(proxiedUrl);

  return (
    <div>
      {isGiphy && externalGifUrl && <GiphyMessage messagePhotoUrl={externalGifUrl} />}

      {!isGiphy && isS3File && imageBlob && (
        <Image src={URL.createObjectURL(imageBlob)} alt="slika" style={{ maxWidth: '30vw' }} />
      )}

      {!isGiphy && !isS3File && <ContentFormatter text={message} />}

      {error && !isGiphy && <p className="text-red-500">❌ Error loading image</p>}
      <RecordCreatedAt className="text-right" createdAt={createdAt} />
    </div>
  );
};

const CurrentUserMessageTemplate = ({
  userName,
  message,
  createdAt,
  messagePhotoUrl,
  showAvatar,
  messageType,
  currentUserId,
}: CurrentUserMessageTemplateProps) => {
  return (
    <div className={`flex flex-end ml-auto max-w-fit ${showAvatar ? 'mr-0' : 'mr-[26px]'}`}>
      <div className={`${messageStyles} flex bg-blue`}>
        <MessageContent
          messageType={messageType}
          messagePhotoUrl={messagePhotoUrl}
          message={message}
          createdAt={createdAt}
        />
      </div>
      {showAvatar && (
        <div className="ml-0.5">
          <UserAvatar
            className="w-12 h-12 rounded-full"
            avatarFallbackName={userName}
            userId={String(currentUserId)}
            color="black"
          />
        </div>
      )}
    </div>
  );
};

const OtherUserMessageTemplate = ({
  userName,
  message,
  otherUserId,
  createdAt,
  messagePhotoUrl,
  showAvatar,
  messageType,
}: OtherUserMessageTemplateProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex">
      {showAvatar && (
        <div className="cursor-pointer mr-0.5" onClick={() => navigate(`/user/${otherUserId}`)}>
          <UserAvatar
            color="black"
            avatarFallbackName={userName}
            userId={String(otherUserId)}
            className="w-[40px] h-[40px] rounded-full"
          />
        </div>
      )}
      <div className={`${messageStyles} bg-black ${!showAvatar ? 'ml-[26px]' : 'ml-0'}`}>
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
  otherUserName,
  currentUserName,
  otherUserId,
  messagePhotoUrl,
  showAvatar,
  currentUserId,
  isCurrentUserLoading,
}: IMessageProps) => {
  const isFromCurrentUser = message.User.id === currentUserId;

  if (isCurrentUserLoading) {
    return (
      <div className={`flex flex-end ml-auto max-w-fit ${showAvatar ? 'mr-0' : 'mr-[26px]'}`}>
        <div className={`${messageStyles} flex bg-blue animate-pulse`}>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        {showAvatar && (
          <div className="ml-0.5">
            <UserAvatar
              className="w-12 h-12 rounded-full"
              avatarFallbackName={currentUserName}
              userId={String(currentUserId)}
              color="black"
            />
          </div>
        )}
      </div>
    );
  }

  if (!currentUserId) return null;

  return isFromCurrentUser ? (
    <CurrentUserMessageTemplate
      userName={currentUserName}
      message={message.message}
      createdAt={message.createdAt}
      messagePhotoUrl={messagePhotoUrl}
      showAvatar={showAvatar}
      messageType={message.type}
      currentUserId={currentUserId}
      isCurrentUserLoading={isCurrentUserLoading}
    />
  ) : (
    <OtherUserMessageTemplate
      userName={otherUserName}
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
