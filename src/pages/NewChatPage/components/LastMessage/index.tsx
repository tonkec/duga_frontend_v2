import clsx from 'clsx';
import { IMessage } from '@app/pages/ChatPage/components/Message';
import { getMessagePreviewText } from '@app/utils/getMessagePreviewText';

interface ILastMessageProps {
  message: IMessage;
  isUnread?: boolean;
}

const LastMessage = ({ message, isUnread }: ILastMessageProps) => {
  const preview = getMessagePreviewText(message);
  if (!preview) return null;

  return (
    <span
      className={clsx(
        'block truncate text-sm',
        isUnread ? 'font-medium text-gray-700' : 'text-gray-500'
      )}
    >
      {preview}
    </span>
  );
};

export default LastMessage;
