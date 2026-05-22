import { IMessage } from '@app/pages/ChatPage/components/Message';
import { getMessagePreviewText } from '@app/utils/getMessagePreviewText';

interface ILastMessageProps {
  message: IMessage;
}

const LastMessage = ({ message }: ILastMessageProps) => {
  const preview = getMessagePreviewText(message);
  if (!preview) return null;
  return <span className="line-clamp-2">{preview}</span>;
};

export default LastMessage;
