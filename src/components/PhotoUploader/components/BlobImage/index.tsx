import { useGetImageBlob } from '@app/components/LatestUploads/hooks';

interface IExsitingImageProps {
  imageUrl: string;
  name: string;
}

const BlobImage = ({ imageUrl, name }: IExsitingImageProps) => {
  const { data: imageBlob } = useGetImageBlob(imageUrl || '');

  if (!imageBlob) {
    return null;
  }
  return <img src={URL.createObjectURL(imageBlob)} alt={name} />;
};

export default BlobImage;
