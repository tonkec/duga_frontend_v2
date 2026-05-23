import { getImageUrl } from '@app/utils/getImageUrl';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import { IImage } from '../..';
import Image from '@app/components/Image';

interface IPhotoProps {
  image: IImage;
  onClick?: () => void;
}

const Photo = ({ image, onClick }: IPhotoProps) => {
  const { data: imageBlob } = useGetImageBlob(image?.securePhotoUrl || '');

  return (
    <Image
      src={imageBlob ? URL.createObjectURL(imageBlob) : getImageUrl(image)}
      alt="fotografija"
      onClick={onClick}
      className={`rounded-md ${onClick ? 'cursor-pointer' : ''}`}
    />
  );
};
export default Photo;
