import { getSafeRemoteImageUrl } from '@app/utils/mediaSafety';

interface IGiphyMessageProps {
  messagePhotoUrl: string;
}

const GiphyMessage = ({ messagePhotoUrl }: IGiphyMessageProps) => {
  const safeGifUrl = getSafeRemoteImageUrl(messagePhotoUrl);

  if (!safeGifUrl) {
    return <span>GIF</span>;
  }

  return (
    <img
      src={safeGifUrl}
      alt="gif"
      style={{ maxWidth: '100px' }}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
};

export default GiphyMessage;
