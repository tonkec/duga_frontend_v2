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

  return (
    <div
      onScroll={debounceScroll(() => {
        loadMore();
      }, 500)}
      style={{ height: '300px', overflow: 'auto' }}
    >
      {allMessages.map((message) => (
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
