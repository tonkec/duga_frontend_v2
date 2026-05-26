import { useLayoutEffect, useRef } from 'react';
import Message, { IMessage } from '@app/pages/ChatPage/components/Message';
import { debounceScroll } from '@app/utils/debounceScroll';

const PaginatedMessages = ({
  otherUserName,
  currentUserName,
  otherUserId,
  otherUserPublicId,
  receivedMessages,
  currentUserId,
  isCurrentUserLoading,
  messages,
  fetchNextPage,
  onReactionToggle,
  messageSearchQuery = '',
}: {
  otherUserName: string;
  currentUserName: string;
  otherUserId: number | undefined;
  otherUserPublicId?: string;
  receivedMessages: IMessage[];
  messages: IMessage[];
  fetchNextPage: () => void;
  currentUserId: number;
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
            key={message.id ?? `${message.createdAt}-${index}`}
            message={message}
            otherUserId={otherUserId}
            otherUserPublicId={otherUserPublicId}
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
