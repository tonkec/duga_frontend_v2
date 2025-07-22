interface IGiphyMessageProps {
  messagePhotoUrl: string;
}

const GiphyMessage = ({ messagePhotoUrl }: IGiphyMessageProps) => {
  return (
    <img
      className="cursor-pointer"
      src={messagePhotoUrl}
      alt="message"
      width={100}
      onClick={() => window.open(messagePhotoUrl, '_blank')}
      referrerPolicy="no-referrer"
    />
  );
};

export default GiphyMessage;
