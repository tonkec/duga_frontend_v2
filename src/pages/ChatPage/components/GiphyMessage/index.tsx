import Image from '@app/components/Image';

interface IGiphyMessageProps {
  messagePhotoUrl: string;
}

const GiphyMessage = ({ messagePhotoUrl }: IGiphyMessageProps) => {
  return (
    <Image
      src={messagePhotoUrl}
      alt="message"
      style={{ width: 200 }}
      onClick={() => window.open(messagePhotoUrl, '_blank')}
      className="cursor-pointer"
    />
  );
};

export default GiphyMessage;
