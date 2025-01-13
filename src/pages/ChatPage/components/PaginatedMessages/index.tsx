import Message from '../Message';
import { debounceScroll } from '../../../../utils/debounceScroll';
import usePaginatedMessages from './hooks/usePaginatedMessages';

interface Message {
  id: string;
  message: string;
  createdAt: string;
  User: {
    id: number;
  };
}

const PaginatedMessages = ({
  otherUserProfilePhoto,
  currentUserProfilePhoto,
  otherUserName,
  currentUserName,
  otherUserId,
  receivedMessages,
}: {
  otherUserProfilePhoto: string;
  currentUserProfilePhoto: string;
  otherUserName: string;
  currentUserName: string;
  otherUserId: number | undefined;
  receivedMessages: Message[];
}) => {
  const { messages, loadMore } = usePaginatedMessages();
  const allMessages = [...receivedMessages, ...messages];
  const sortedMessages = allMessages.sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div
      onScroll={debounceScroll(() => {
        loadMore();
      }, 500)}
      style={{ height: '500px', overflow: 'auto' }}
    >
      {sortedMessages.map((message) => (
        <Message
          otherUserName={otherUserName}
          currentUserName={currentUserName}
          currentUserProfilePhoto={currentUserProfilePhoto}
          otherUserProfilePhoto={otherUserProfilePhoto}
          key={message.id}
          message={message}
          otherUserId={otherUserId}
        />
      ))}
    </div>
  );
};

export default PaginatedMessages;
