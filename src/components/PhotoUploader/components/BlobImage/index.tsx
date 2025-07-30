import { useGetImageBlob } from '@app/components/LatestUploads/hooks';

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

  return <img src={URL.createObjectURL(imageBlob)} alt={name} className={className} />;
};

export default BlobImage;
