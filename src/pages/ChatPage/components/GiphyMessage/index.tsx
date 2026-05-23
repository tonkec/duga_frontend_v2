interface IGiphyMessageProps {
  messagePhotoUrl: string;
}

const GiphyMessage = ({ messagePhotoUrl }: IGiphyMessageProps) => {
  return <img src={messagePhotoUrl} alt="gif" style={{ maxWidth: '100px' }} />;
};

export default GiphyMessage;
