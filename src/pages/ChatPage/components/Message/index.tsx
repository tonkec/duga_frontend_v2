import { useNavigate } from 'react-router';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import UserAvatar from '@app/components/UserAvatar';
import GiphyMessage from '../GiphyMessage';
import ContentFormatter from '@app/components/ContentFormatter';
import Image from '@app/components/Image';
import { useEffect, useRef, useState } from 'react';
import { BiSmile } from 'react-icons/bi';
import { getUserProfilePath } from '@app/utils/userProfilePath';
import { useObjectUrl } from '@app/hooks/useObjectUrl';
import type { IImage } from '@app/components/Photos';

export type MessageType = 'text' | 'file' | 'gif';

interface MentionedUser {
  id: number;
  publicId?: string;
  username?: string;
  avatar?: string;
}

interface BaseMessageTemplateProps {
  userName: string;
  message: string | null;
  createdAt: string;
  messagePhotoUrl: string;
  showAvatar: boolean;
  messageType: MessageType;
  chatMessage: IMessage;
  currentUserId: number;
  currentUserProfilePhoto?: Partial<IImage>;
  onReactionToggle: (message: IMessage, emoji: string, hasReacted: boolean) => void;
}

export interface IMessageReaction {
  emoji: string;
  count?: number;
  reactionCount?: number;
  reactedByCurrentUser?: boolean;
  currentUserReacted?: boolean;
  hasReacted?: boolean;
  userIds?: number[];
  users?: Array<{ id: number }>;
}

export interface IMessage {
  message: string | null;
  createdAt: string;
  type: MessageType;
  User: {
    id: number;
    username?: string;
  };
  id: number;
  securePhotoUrl: string;
  fromUserId: number;
  messagePhotoUrl: string;
  chatId: number;
  reactions?: IMessageReaction[];
  Reactions?: IMessageReaction[];
  reactionCount?: number;
  currentUserReactions?: string[];
  myReactions?: string[];
  userReactions?: string[];
  mentionedUsers?: MentionedUser[];
}

interface IMessageProps {
  message: IMessage;
  otherUserName: string;
  currentUserName: string;
  otherUserId?: number;
  otherUserPublicId?: string;
  otherUserProfilePhoto?: Partial<IImage>;
  messagePhotoUrl: string;
  showAvatar: boolean;
  currentUserId: number;
  currentUserProfilePhoto?: Partial<IImage>;
  isCurrentUserLoading: boolean;
  onReactionToggle: (message: IMessage, emoji: string, hasReacted: boolean) => void;
}

interface OtherUserMessageTemplateProps extends BaseMessageTemplateProps {
  otherUserId?: number;
  otherUserPublicId?: string;
  otherUserProfilePhoto?: Partial<IImage>;
}

interface CurrentUserMessageTemplateProps extends BaseMessageTemplateProps {
  currentUserId: number;
  isCurrentUserLoading: boolean;
  currentUserProfilePhoto?: Partial<IImage>;
}

interface IMessageContentProps {
  messagePhotoUrl: string;
  message: string | null;
  createdAt: string;
  messageType: string;
  isOwnMessage?: boolean;
  mentionedUsers?: MentionedUser[];
}

const getMessageSenderId = (msg: IMessage) => Number(msg.fromUserId ?? msg.User?.id);

const bubbleBase =
  'flex flex-col gap-1 px-4 py-2.5 shadow-sm max-w-[min(85%,20rem)] break-words text-sm leading-relaxed';
const REACTION_PICKER_EMOJIS = ['👍', '💪', '❤️', '🔥', '✨', '🎉', '🌈', '💬'];

const hasCurrentUserReacted = (
  message: IMessage,
  reaction: IMessageReaction | undefined,
  emoji: string,
  currentUserId: number
) => {
  const userReactions = [
    ...(message.userReactions ?? []),
    ...(message.currentUserReactions ?? []),
    ...(message.myReactions ?? []),
  ];

  return Boolean(
    userReactions.includes(emoji) ||
      reaction?.reactedByCurrentUser ||
      reaction?.currentUserReacted ||
      reaction?.hasReacted ||
      reaction?.userIds?.includes(currentUserId) ||
      reaction?.users?.some((user) => user.id === currentUserId)
  );
};

const getMessageReactionCount = (reaction: IMessageReaction | undefined) =>
  Math.max(0, Number(reaction?.count ?? reaction?.reactionCount ?? 0));

const getMessageReactions = (message: IMessage) => message.reactions ?? message.Reactions ?? [];

const getImageSourceFromMessageText = (message: string) => {
  const trimmedMessage = message.trim();
  if (!trimmedMessage || /\s/.test(trimmedMessage)) return '';

  return /\.(png|jpe?g|gif|webp)(?:[?#].*)?$/i.test(trimmedMessage) ? trimmedMessage : '';
};

const isEmojiOnlyMessage = (message: string) => {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return false;

  return /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D\s]+$/u.test(trimmedMessage);
};

const openMediaInNewTab = (url: string) => {
  const mediaWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (mediaWindow) {
    mediaWindow.opener = null;
  }
};

const MessageContent = ({
  messagePhotoUrl,
  message,
  createdAt,
  messageType,
  isOwnMessage = false,
  mentionedUsers = [],
}: IMessageContentProps) => {
  const messageText = typeof message === 'string' ? message : '';
  const isGiphy = messageType === 'gif';
  const isFileMessage = messageType === 'file';
  const isLegacyImagePlaceholder = messageText.trim().toLowerCase() === 'slika';
  const messageImageSource = getImageSourceFromMessageText(messageText);
  const imageSource = messagePhotoUrl || messageImageSource;
  const hasImageAttachment = !isGiphy && Boolean(imageSource);
  const hasMissingImageAttachment =
    !isGiphy && !hasImageAttachment && (isFileMessage || isLegacyImagePlaceholder);

  const {
    data: imageBlob,
    error,
    isLoading,
  } = useGetImageBlob(hasImageAttachment ? imageSource : '');
  const imageBlobUrl = useObjectUrl(imageBlob);
  const shouldShowImageFallback =
    hasMissingImageAttachment || (hasImageAttachment && !imageBlobUrl && !isLoading && !error);
  const isEmojiOnly = isEmojiOnlyMessage(messageText);

  return (
    <div>
      {isGiphy && messagePhotoUrl && <GiphyMessage messagePhotoUrl={messagePhotoUrl} />}

      {hasImageAttachment && imageBlobUrl && (
        <button
          type="button"
          className="block w-full cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          onClick={() => openMediaInNewTab(imageBlobUrl)}
          aria-label="Otvori fotografiju u novom tabu"
        >
          <Image
            src={imageBlobUrl}
            alt="Fotografija iz poruke"
            className="max-h-[min(32rem,60vh)] w-full max-w-full rounded-xl object-contain"
          />
        </button>
      )}

      {!isGiphy && !hasImageAttachment && !hasMissingImageAttachment && (
        <div className={isEmojiOnly ? 'text-3xl leading-none' : undefined}>
          <ContentFormatter
            text={messageText}
            taggedUsers={mentionedUsers}
            linkClassName={
              isOwnMessage ? 'font-semibold text-white underline' : 'text-blue underline'
            }
          />
        </div>
      )}

      {shouldShowImageFallback && (
        <p className={isOwnMessage ? 'text-sm font-medium text-white' : 'text-sm text-gray-500'}>
          Fotografija se ne može učitati.
        </p>
      )}
      {error && !isGiphy && (
        <p className={isOwnMessage ? 'text-sm font-medium text-white' : 'text-sm text-red-500'}>
          Greška pri učitavanju fotografije.
        </p>
      )}
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
  chatMessage,
  currentUserId,
  currentUserProfilePhoto,
  onReactionToggle,
}: CurrentUserMessageTemplateProps) => {
  return (
    <div className={`flex w-full flex-col items-end ${showAvatar ? '' : 'pr-11'}`}>
      <div className="flex w-full items-end justify-end gap-2">
        <div className="flex max-w-[min(85%,20rem)] min-w-0 items-center justify-end gap-2">
          <MessageReactionPicker
            message={chatMessage}
            currentUserId={currentUserId}
            onReactionToggle={onReactionToggle}
            align="right"
          />
          <div
            className={`${bubbleBase} chat-bubble-own max-w-full rounded-2xl rounded-br-sm bg-blue text-white`}
          >
            <MessageContent
              messageType={messageType}
              messagePhotoUrl={messagePhotoUrl}
              message={message}
              createdAt={createdAt}
              isOwnMessage
              mentionedUsers={chatMessage.mentionedUsers}
            />
          </div>
        </div>
        {showAvatar && (
          <UserAvatar
            className="h-9 w-9 shrink-0 rounded-full border border-[#dce4ff]"
            avatarFallbackName={userName}
            userId={String(currentUserId)}
            color="#eef3ff"
            fgColor="#2D46B9"
            profilePhoto={currentUserProfilePhoto}
          />
        )}
      </div>
      <div className={showAvatar ? 'pr-11' : ''}>
        <MessageReactionSummary
          message={chatMessage}
          currentUserId={currentUserId}
          onReactionToggle={onReactionToggle}
          align="right"
        />
      </div>
    </div>
  );
};

const OtherUserMessageTemplate = ({
  userName,
  message,
  otherUserId,
  otherUserPublicId,
  otherUserProfilePhoto,
  createdAt,
  messagePhotoUrl,
  showAvatar,
  messageType,
  chatMessage,
  currentUserId,
  onReactionToggle,
}: OtherUserMessageTemplateProps) => {
  const navigate = useNavigate();

  return (
    <div className={`flex w-full flex-col items-start ${!showAvatar ? 'pl-11' : ''}`}>
      <div className="flex w-full items-end gap-2">
        {showAvatar && (
          <button
            type="button"
            className="shrink-0 cursor-pointer rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue"
            onClick={() =>
              navigate(getUserProfilePath({ id: otherUserId, publicId: otherUserPublicId }))
            }
          >
            <UserAvatar
              color="#eef3ff"
              fgColor="#2D46B9"
              avatarFallbackName={userName}
              userId={String(otherUserId)}
              className="h-9 w-9 rounded-full border border-[#dce4ff]"
              profilePhoto={otherUserProfilePhoto}
            />
          </button>
        )}
        <div className="flex max-w-[min(85%,20rem)] min-w-0 items-center gap-2">
          <div
            className={`${bubbleBase} chat-bubble-other max-w-full rounded-2xl rounded-bl-sm border border-[#dce4ff] bg-[#f0f4ff] text-gray-900`}
          >
            <MessageContent
              messageType={messageType}
              messagePhotoUrl={messagePhotoUrl}
              message={message}
              createdAt={createdAt}
              mentionedUsers={chatMessage.mentionedUsers}
            />
          </div>
          <MessageReactionPicker
            message={chatMessage}
            currentUserId={currentUserId}
            onReactionToggle={onReactionToggle}
            align="left"
          />
        </div>
      </div>
      <div className={showAvatar ? 'pl-11' : ''}>
        <MessageReactionSummary
          message={chatMessage}
          currentUserId={currentUserId}
          onReactionToggle={onReactionToggle}
          align="left"
        />
      </div>
    </div>
  );
};

const MessageReactionPicker = ({
  message,
  currentUserId,
  onReactionToggle,
  align,
}: {
  message: IMessage;
  currentUserId: number;
  onReactionToggle: (message: IMessage, emoji: string, hasReacted: boolean) => void;
  align: 'left' | 'right';
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const reactions = getMessageReactions(message);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative shrink-0 self-center" ref={pickerRef}>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dce4ff] bg-white text-gray-500 shadow-sm transition-colors hover:border-blue hover:bg-[#f0f4ff] hover:text-blue"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label="Dodaj reakciju"
      >
        <BiSmile size={18} />
      </button>
      {isOpen && (
        <div
          className={`absolute top-10 z-40 w-44 rounded-2xl border border-[#dce4ff] bg-white p-2 shadow-xl shadow-blue-dark/15 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="grid grid-cols-4 gap-1">
            {REACTION_PICKER_EMOJIS.map((emoji) => {
              const reaction = reactions.find((item) => item.emoji === emoji);
              const hasReacted = hasCurrentUserReacted(message, reaction, emoji, currentUserId);

              return (
                <button
                  key={emoji}
                  type="button"
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xl transition-transform hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-blue/30 ${
                    hasReacted ? 'bg-blue/10' : 'hover:bg-[#f0f4ff]'
                  }`}
                  onClick={() => {
                    onReactionToggle(message, emoji, hasReacted);
                    setIsOpen(false);
                  }}
                  aria-label={`Odaberi emoji ${emoji}`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const MessageReactionSummary = ({
  message,
  currentUserId,
  onReactionToggle,
  align,
}: {
  message: IMessage;
  currentUserId: number;
  onReactionToggle: (message: IMessage, emoji: string, hasReacted: boolean) => void;
  align: 'left' | 'right';
}) => {
  const reactions = getMessageReactions(message).filter(
    (reaction) => getMessageReactionCount(reaction) > 0
  );

  if (!reactions.length) return null;

  return (
    <div
      className={`mt-1 flex flex-wrap gap-1 ${align === 'right' ? 'justify-end' : 'justify-start'}`}
    >
      {reactions.map((reaction) => {
        const emoji = reaction.emoji;
        const count = getMessageReactionCount(reaction);
        const hasReacted = hasCurrentUserReacted(message, reaction, emoji, currentUserId);

        return (
          <button
            key={emoji}
            type="button"
            className={`inline-flex min-h-7 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold shadow-sm transition-colors ${
              hasReacted
                ? 'border-blue bg-blue text-white'
                : 'border-[#dce4ff] bg-white text-gray-600 hover:border-blue hover:text-blue'
            }`}
            onClick={() => onReactionToggle(message, emoji, hasReacted)}
            aria-label={`${hasReacted ? 'Makni' : 'Dodaj'} reakciju ${emoji}`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="tabular-nums">{count}</span>}
          </button>
        );
      })}
    </div>
  );
};

const Message = ({
  message,
  otherUserName,
  currentUserName,
  otherUserId,
  otherUserPublicId,
  otherUserProfilePhoto,
  messagePhotoUrl,
  showAvatar,
  currentUserId,
  isCurrentUserLoading,
  currentUserProfilePhoto,
  onReactionToggle,
}: IMessageProps) => {
  const senderId = getMessageSenderId(message);
  const isFromCurrentUser = senderId === Number(currentUserId);
  const senderName = message.User?.username || otherUserName;

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
            profilePhoto={currentUserProfilePhoto}
          />
        )}
      </div>
    );
  }

  if (currentUserId == null) return null;

  return (
    <div data-testid="chat-message">
      {isFromCurrentUser ? (
        <CurrentUserMessageTemplate
          userName={currentUserName}
          message={message.message}
          createdAt={message.createdAt}
          messagePhotoUrl={messagePhotoUrl}
          showAvatar={showAvatar}
          messageType={message.type}
          chatMessage={message}
          currentUserId={currentUserId}
          isCurrentUserLoading={isCurrentUserLoading}
          currentUserProfilePhoto={currentUserProfilePhoto}
          onReactionToggle={onReactionToggle}
        />
      ) : (
        <OtherUserMessageTemplate
          userName={senderName}
          message={message.message}
          otherUserId={senderId || otherUserId}
          otherUserPublicId={senderId === Number(otherUserId) ? otherUserPublicId : undefined}
          otherUserProfilePhoto={otherUserProfilePhoto}
          createdAt={message.createdAt}
          messagePhotoUrl={messagePhotoUrl}
          showAvatar={showAvatar}
          messageType={message.type}
          chatMessage={message}
          currentUserId={currentUserId}
          onReactionToggle={onReactionToggle}
        />
      )}
    </div>
  );
};

export default Message;
