import { useGetImageBlob } from '@app/components/LatestUploads/hooks';

interface IExsitingImageProps {
  imageUrl: string;
  name: string;
}

const ExistingImage = ({ imageUrl, name }: IExsitingImageProps) => {
  const { data: imageBlob } = useGetImageBlob(imageUrl || '');

  if (!imageBlob) {
    return null;
  }
  return <img src={URL.createObjectURL(imageBlob)} alt={name} />;
};

export default ExistingImage;
