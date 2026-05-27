import Image from '@app/components/Image';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import { getForumImageUrl } from '../utils/forumImages';
import { getSafeRemoteImageUrl } from '@app/utils/mediaSafety';
import { useObjectUrl } from '@app/hooks/useObjectUrl';

interface ForumImageProps {
  alt: string;
  className?: string;
  imageUrl?: string | null;
  securePhotoUrl?: string | null;
}

const ForumImage = ({ alt, className, imageUrl, securePhotoUrl }: ForumImageProps) => {
  const { data: imageBlob } = useGetImageBlob(securePhotoUrl || '');
  const imageBlobUrl = useObjectUrl(imageBlob);
  const fallbackImageUrl = getForumImageUrl(undefined, imageUrl);
  const src = imageBlobUrl || getSafeRemoteImageUrl(fallbackImageUrl);

  if (!src) {
    return null;
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer nofollow"
      referrerPolicy="no-referrer"
      className="inline-block max-w-full"
    >
      <Image
        src={src}
        alt={alt}
        className={`${className ?? ''} cursor-pointer transition-opacity hover:opacity-90`}
        loading
        referrerPolicy="no-referrer"
      />
    </a>
  );
};

export default ForumImage;
