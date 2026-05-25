import ForumImage from './ForumImage';
import { getForumImageItems } from '../utils/forumImages';
import type { Answer, Question } from '../types/forum.types';

interface ForumImageGalleryProps {
  alt: string;
  className?: string;
  imageClassName?: string;
  item: Pick<Question | Answer, 'imageUrl' | 'imageUrls' | 'securePhotoUrl' | 'securePhotoUrls'>;
}

const ForumImageGallery = ({ alt, className = '', imageClassName, item }: ForumImageGalleryProps) => {
  const images = getForumImageItems(item);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-3 ${images.length > 1 ? 'sm:grid-cols-2' : ''} ${className}`}>
      {images.map((image, index) => (
        <ForumImage
          key={`${image.securePhotoUrl ?? image.imageUrl}-${index}`}
          securePhotoUrl={image.securePhotoUrl}
          imageUrl={image.imageUrl}
          alt={images.length > 1 ? `${alt} ${index + 1}` : alt}
          className={imageClassName}
        />
      ))}
    </div>
  );
};

export default ForumImageGallery;
