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
  isOwnMessage?: boolean;
}

const getMessageSenderId = (msg: IMessage) => Number(msg.fromUserId ?? msg.User?.id);

const bubbleBase =
  'flex flex-col gap-1 px-4 py-2.5 shadow-sm max-w-[min(85%,20rem)] break-words text-sm leading-relaxed';

const MessageContent = ({
  messagePhotoUrl,
  message,
  createdAt,
  messageType,
  isOwnMessage = false,
}: IMessageContentProps) => {
  const isS3File = messageType === 'file';
  const isGiphy = messageType === 'gif';

  const { data: imageBlob, error } = useGetImageBlob(
    !isGiphy && isS3File ? messagePhotoUrl || '' : ''
  );

  return (
    <div>
      {isGiphy && messagePhotoUrl && <GiphyMessage messagePhotoUrl={messagePhotoUrl} />}

      {!isGiphy && isS3File && imageBlob && (
        <Image src={URL.createObjectURL(imageBlob)} alt="slika" style={{ maxWidth: '30vw' }} />
      )}

      {!isGiphy && !isS3File && <ContentFormatter text={message} />}

      {error && !isGiphy && <p className="text-red-500">❌ Error loading image</p>}
      <RecordCreatedAt
        className={`text-right ${isOwnMessage ? '!text-blue-100' : ''}`}
        createdAt={createdAt}
      />
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
    <div className={`flex w-full items-end justify-end gap-2 ${showAvatar ? '' : 'pr-11'}`}>
      <div className={`${bubbleBase} rounded-2xl rounded-br-sm bg-blue text-white`}>
        <MessageContent
          messageType={messageType}
          messagePhotoUrl={messagePhotoUrl}
          message={message}
          createdAt={createdAt}
          isOwnMessage
        />
      </div>
      {showAvatar && (
        <UserAvatar
          className="h-9 w-9 shrink-0 rounded-full"
          avatarFallbackName={userName}
          userId={String(currentUserId)}
          color="#2D46B9"
        />
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
    <div className={`flex w-full items-end justify-start gap-2 ${!showAvatar ? 'pl-11' : ''}`}>
      {showAvatar && (
        <button
          type="button"
          className="shrink-0 cursor-pointer rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue"
          onClick={() => navigate(`/user/${otherUserId}`)}
        >
          <UserAvatar
            color="#F037A5"
            avatarFallbackName={userName}
            userId={String(otherUserId)}
            className="h-9 w-9 rounded-full"
          />
        </button>
      )}
      <div
        className={`${bubbleBase} rounded-2xl rounded-bl-sm border border-[#e8eeff] bg-white text-gray-900`}
      >
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
  const isFromCurrentUser = getMessageSenderId(message) === Number(currentUserId);

  if (isCurrentUserLoading) {
    return (
      <div className={`flex w-full items-end justify-end gap-2 ${showAvatar ? '' : 'pr-11'}`}>
        <div className={`${bubbleBase} animate-pulse rounded-2xl rounded-br-sm bg-blue/40`}>
          <div className="mb-2 h-4 w-3/4 rounded bg-white/30" />
          <div className="h-3 w-1/2 rounded bg-white/30" />
        </div>
        {showAvatar && currentUserId !== undefined && (
          <UserAvatar
            className="h-9 w-9 shrink-0 rounded-full"
            avatarFallbackName={currentUserName}
            userId={String(currentUserId)}
            color="#2D46B9"
          />
        )}
      </div>
    );
  }

  if (currentUserId == null) return null;

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
