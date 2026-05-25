import Image from '@app/components/Image';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import { getForumImageUrl } from '../utils/forumImages';

interface ForumImageProps {
  alt: string;
  className?: string;
  imageUrl?: string | null;
  securePhotoUrl?: string | null;
}

const ForumImage = ({ alt, className, imageUrl, securePhotoUrl }: ForumImageProps) => {
  const { data: imageBlob } = useGetImageBlob(securePhotoUrl || '');
  const fallbackImageUrl = getForumImageUrl(undefined, imageUrl);
  const src = imageBlob ? URL.createObjectURL(imageBlob) : fallbackImageUrl;

  if (!src) {
    return null;
  }

  return (
    <a href={src} target="_blank" rel="noreferrer" className="inline-block max-w-full">
      <Image
        src={src}
        alt={alt}
        className={`${className ?? ''} cursor-pointer transition-opacity hover:opacity-90`}
        loading
      />
    </a>
  );
};

export default ForumImage;
