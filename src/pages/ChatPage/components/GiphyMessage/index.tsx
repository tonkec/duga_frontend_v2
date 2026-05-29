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
      alt="GIF iz poruke"
      className="max-h-[min(24rem,50vh)] w-full max-w-full rounded-xl object-contain"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
};

export default GiphyMessage;
