import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import Image from '@app/components/Image';

interface IExsitingImageProps {
  imageUrl: string;
  name: string;
  className?: string;
}

const BlobImage = ({ imageUrl, name, className }: IExsitingImageProps) => {
  const { data: imageBlob } = useGetImageBlob(imageUrl || '');

  if (!imageBlob) {
    return null;
  }

  return <Image src={URL.createObjectURL(imageBlob)} alt={name} className={className} />;
};

export default BlobImage;
