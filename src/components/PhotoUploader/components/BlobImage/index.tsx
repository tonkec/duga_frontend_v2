import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import Image from '@app/components/Image';
import { useObjectUrl } from '@app/hooks/useObjectUrl';

interface IExsitingImageProps {
  imageUrl: string;
  name: string;
  className?: string;
}

const BlobImage = ({ imageUrl, name, className }: IExsitingImageProps) => {
  const { data: imageBlob } = useGetImageBlob(imageUrl || '');
  const imageBlobUrl = useObjectUrl(imageBlob);

  if (!imageBlobUrl) {
    return null;
  }

  return <Image src={imageBlobUrl} alt={name} className={className} />;
};

export default BlobImage;
