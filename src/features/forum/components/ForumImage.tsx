import Image from '@app/components/Image';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import { getForumImageUrl } from '../utils/forumImages';
import {
  getSafeBackendMediaPath,
  getSafeRemoteImageUrl,
  getSafeS3BackendMediaPath,
} from '@app/utils/mediaSafety';
import { useObjectUrl } from '@app/hooks/useObjectUrl';

interface ForumImageProps {
  alt: string;
  className?: string;
  imageUrl?: string | null;
  securePhotoUrl?: string | null;
}

const ForumImage = ({ alt, className, imageUrl, securePhotoUrl }: ForumImageProps) => {
  const imageSource = securePhotoUrl || imageUrl || '';
  const { data: imageBlob } = useGetImageBlob(imageSource);
  const imageBlobUrl = useObjectUrl(imageBlob);
  const fallbackImageUrl = getForumImageUrl(undefined, imageUrl);
  const isBlobOnlySource = Boolean(
    getSafeBackendMediaPath(imageSource) || getSafeS3BackendMediaPath(imageSource)
  );
  const src = imageBlobUrl || getSafeRemoteImageUrl(fallbackImageUrl);

  if (!src || (isBlobOnlySource && !imageBlobUrl)) {
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
