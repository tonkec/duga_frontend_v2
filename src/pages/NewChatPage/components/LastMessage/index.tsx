import BlobImage from '@app/components/PhotoUploader/components/BlobImage';
import { IMessage } from '@app/pages/ChatPage/components/Message';

interface ILastMessageProps {
  message: IMessage;
}

const LastMessage = ({ message }: ILastMessageProps) => {
  if (message.message) {
    <p className="text-gray-500">{message.message}</p>;
  }

  return <BlobImage imageUrl={message.securePhotoUrl} name="poruka" className="h-16 w-16" />;
};

export default LastMessage;
