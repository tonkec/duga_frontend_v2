import { useNavigate } from 'react-router';
import { getImageUrl } from '@app/utils/getImageUrl';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import { IImage } from '../..';

interface IPhotoProps {
  image: IImage;
}

const Photo = ({ image }: IPhotoProps) => {
  const navigate = useNavigate();
  const { data: imageBlob } = useGetImageBlob(image?.securePhotoUrl || '');

  return (
    <img
      src={imageBlob ? URL.createObjectURL(imageBlob) : getImageUrl(image)}
      alt="user image"
      onClick={() => {
        navigate(`/photo/${image.id}`);
      }}
      className="cursor-pointer w-full object-cover rounded-md"
    />
  );
};
export default Photo;
