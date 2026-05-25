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
      className={`h-full w-full rounded-2xl object-cover transition-transform duration-300 ${
        onClick ? 'cursor-pointer group-hover:scale-[1.02]' : ''
      }`}
    />
  );
};
export default Photo;
