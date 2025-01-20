import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useGetAllMessages } from '../../../hooks';

interface Message {
  id: string;
  message: string;
  createdAt: string;
  User: {
    id: number;
  };
}

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
  }, [page, refetchAllMessages]);

  return { messages: messages ?? [], loadMore };
};

export default usePaginatedMessages;
