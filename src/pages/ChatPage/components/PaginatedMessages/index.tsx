import { useLayoutEffect, useRef } from 'react';
import Message, { IMessage } from '@app/pages/ChatPage/components/Message';
import { debounceScroll } from '@app/utils/debounceScroll';
import type { IImage } from '@app/components/Photos';
import Loader from '@app/components/Loader';

const PaginatedMessages = ({
  otherUserName,
  currentUserName,
  otherUserId,
  otherUserPublicId,
  otherUserProfilePhoto,
  receivedMessages,
  currentUserId,
  currentUserProfilePhoto,
  isCurrentUserLoading,
  messages,
  isMessagesLoading,
  fetchNextPage,
  onReactionToggle,
  messageSearchQuery = '',
}: {
  otherUserName: string;
  currentUserName: string;
  otherUserId: number | undefined;
  otherUserPublicId?: string;
  otherUserProfilePhoto?: Partial<IImage>;
  receivedMessages: IMessage[];
  messages: IMessage[];
  isMessagesLoading?: boolean;
  fetchNextPage: () => void;
  currentUserId: number;
  currentUserProfilePhoto?: Partial<IImage>;
  isCurrentUserLoading: boolean;
  onReactionToggle: (message: IMessage, emoji: string, hasReacted: boolean) => void;
  messageSearchQuery?: string;
}) => {
  const allMessages = [...receivedMessages, ...messages];
  const sortedMessages = allMessages.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  const normalizedSearchQuery = messageSearchQuery.trim().toLowerCase();
  const visibleMessages = normalizedSearchQuery
    ? sortedMessages.filter((message) =>
        (message.message ?? '').toLowerCase().includes(normalizedSearchQuery)
      )
    : sortedMessages;

  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);

  const scrollToBottom = () => {
    if (containerRef.current) {
      const scrollHeight = containerRef.current.scrollHeight;
      const clientHeight = containerRef.current.clientHeight;
      containerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const scrollHeight = containerRef.current.scrollHeight;
    if (scrollHeight > prevScrollHeightRef.current) {
      scrollToBottom();
      prevScrollHeightRef.current = scrollHeight;
    }
  }, [messages.length, receivedMessages.length, visibleMessages.length]);

  if (isMessagesLoading) {
    return (
      <div className="flex min-h-[280px] flex-1 items-center justify-center px-4">
        <Loader variant="inline" label="Učitavanje poruka..." />
      </div>
    );
  }

  if (!messages.length && !receivedMessages.length) {
    return (
      <div className="flex min-h-[280px] flex-1 items-center justify-center px-4">
        <p className="text-center text-sm text-gray-500">Nema poruka u ovom razgovoru</p>
      </div>
    );
  }

  if (currentUserId == null) {
    return (
      <div className="flex min-h-[280px] flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">Učitavanje poruka...</p>
      </div>
    );
  }

  const getSenderId = (msg: IMessage) => Number(msg.fromUserId ?? msg.User?.id);

  if (normalizedSearchQuery && visibleMessages.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-1 items-center justify-center px-4">
        <p className="text-center text-sm text-gray-500">Nema poruka koje odgovaraju pretrazi.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={debounceScroll(() => {
        fetchNextPage();
      }, 500)}
      className="flex min-h-[min(420px,calc(100vh-22rem))] max-h-[min(560px,calc(100vh-18rem))] flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
    >
      {visibleMessages.map((message, index) => {
        const previousMessage = visibleMessages[index - 1];
        const showAvatar =
          !previousMessage || getSenderId(previousMessage) !== getSenderId(message);

        return (
          <Message
            otherUserName={otherUserName}
            currentUserName={currentUserName}
            currentUserId={currentUserId}
            currentUserProfilePhoto={currentUserProfilePhoto}
            key={message.id ?? `${message.createdAt}-${index}`}
            message={message}
            otherUserId={otherUserId}
            otherUserPublicId={otherUserPublicId}
            otherUserProfilePhoto={otherUserProfilePhoto}
            messagePhotoUrl={
              message.type === 'gif'
                ? message.messagePhotoUrl
                : message.securePhotoUrl || message.messagePhotoUrl
            }
            showAvatar={showAvatar}
            isCurrentUserLoading={isCurrentUserLoading}
            onReactionToggle={onReactionToggle}
          />
        );
      })}
    </div>
  );
};

export default PaginatedMessages;
