import { useEffect, useState } from 'react';
import { useGetAllMessages } from '../../hooks';
import { useParams } from 'react-router';
import Message from '../Message';

interface Message {
  id: string;
  message: string;
  createdAt: string;
  User: {
    id: number;
  };
}

const debounceScroll = (callback: () => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback();
    }, wait);
  };
};

const usePaginatedMessages = () => {
  const { chatId } = useParams();
  const [page, setPage] = useState(1);
  const { allMessages, refetchAllMessages } = useGetAllMessages(chatId as string, page);
  const [messages, setMessages] = useState<Message[]>([]);
  const loadMore = async () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (allMessages?.data?.messages) {
      setMessages((prev) => [...prev, ...allMessages.data.messages]);
    }
  }, [allMessages]);

  useEffect(() => {
    if (page > 1) {
      refetchAllMessages();
    }
  }, [page]);

  return { messages, loadMore };
};

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
