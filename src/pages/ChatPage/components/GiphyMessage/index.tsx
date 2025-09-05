interface IGiphyMessageProps {
  messagePhotoUrl: string;
}

const GiphyMessage = ({ messagePhotoUrl }: IGiphyMessageProps) => {
  return <img src={messagePhotoUrl} alt="gif" />;
};

export default GiphyMessage;
