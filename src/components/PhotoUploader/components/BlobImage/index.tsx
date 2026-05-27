import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import Image from '@app/components/Image';
import { useObjectUrl } from '@app/hooks/useObjectUrl';

interface IExsitingImageProps {
  imageUrls: string[];
  name: string;
  className?: string;
}

const BlobImage = ({ imageUrls, name, className }: IExsitingImageProps) => {
  const firstImageQuery = useGetImageBlob(imageUrls[0] || '');
  const secondImageQuery = useGetImageBlob(imageUrls[1] || '');
  const thirdImageQuery = useGetImageBlob(imageUrls[2] || '');
  const fourthImageQuery = useGetImageBlob(imageUrls[3] || '');
  const imageBlob = [firstImageQuery, secondImageQuery, thirdImageQuery, fourthImageQuery].find(
    (query) => query.data
  )?.data;
  const imageBlobUrl = useObjectUrl(imageBlob);

  if (!imageBlobUrl) {
    return null;
  }

  return <Image src={imageBlobUrl} alt={name} className={className} />;
};

export default BlobImage;
