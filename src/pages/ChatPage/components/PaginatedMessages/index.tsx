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
}: {
  otherUserProfilePhoto: string;
  currentUserProfilePhoto: string;
  otherUserName: string;
  currentUserName: string;
}) => {
  const { messages, loadMore } = usePaginatedMessages();

  return (
    <div
      onScroll={debounceScroll(() => {
        loadMore();
      }, 500)}
      style={{ height: '300px', overflow: 'auto' }}
    >
      {messages.map((message) => (
        <Message
          otherUserName={otherUserName}
          currentUserName={currentUserName}
          currentUserProfilePhoto={currentUserProfilePhoto}
          otherUserProfilePhoto={otherUserProfilePhoto}
          key={message.id}
          message={message}
        />
      ))}
    </div>
  );
};

export default PaginatedMessages;
