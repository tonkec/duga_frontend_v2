import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useGetAllMessages } from '../../../hooks';

const usePaginatedMessages = () => {
  const { chatId } = useParams();
  const [page, setPage] = useState(1);
  const { allMessages, refetchAllMessages } = useGetAllMessages(chatId as string, page);
  const loadMore = async () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (page > 1) {
      refetchAllMessages();
    }
  }, [page, refetchAllMessages]);

  return { messages: allMessages?.data.messages ?? [], loadMore };
};

export default usePaginatedMessages;
