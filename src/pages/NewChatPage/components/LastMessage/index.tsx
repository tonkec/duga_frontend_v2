import ContentFormatter from '@app/components/ContentFormatter';
import BlobImage from '@app/components/PhotoUploader/components/BlobImage';
import GiphyMessage from '@app/pages/ChatPage/components/GiphyMessage';
import { IMessage } from '@app/pages/ChatPage/components/Message';

interface ILastMessageProps {
  message: IMessage;
}

const LastMessage = ({ message }: ILastMessageProps) => {
  if (message.message) {
    return (
      <p className="text-gray-500">
        <ContentFormatter text={message.message} />
      </p>
    );
  }

  if (message.type === 'gif') {
    return <GiphyMessage messagePhotoUrl={message.messagePhotoUrl} />;
  }

  return <BlobImage imageUrl={message.securePhotoUrl} name="poruka" className="h-16 w-16" />;
};

export default LastMessage;
