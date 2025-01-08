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

const PaginatedMessages = () => {
  const { messages, loadMore } = usePaginatedMessages();

  return (
    <div
      onScroll={debounceScroll(() => {
        loadMore();
      }, 500)}
      style={{ height: '300px', overflow: 'auto' }}
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};

export default PaginatedMessages;
