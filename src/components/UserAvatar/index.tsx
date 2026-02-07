import Avatar from 'react-avatar';
import { useGetProfilePhoto } from './hooks/useGetProfilePhoto';
import Loader from '../Loader';
import { useGetImageBlob } from '../LatestUploads/hooks';
import Image from '../Image';

interface IUserAvatarProps {
  avatarFallbackName: string;
  color: string;
  onClick?: () => void;
  userId: string | undefined;
  size?: string;
  round?: boolean;
  className?: string;
}

const UserAvatar = ({
  avatarFallbackName,
  color,
  onClick,
  userId,
  size = '40',
  round = true,
  className,
}: IUserAvatarProps) => {
  const { profilePhoto, isProfilePhotoLoading } = useGetProfilePhoto(userId || '');
  const { data: imageBlob } = useGetImageBlob(profilePhoto?.data.securePhotoUrl);

  if (isProfilePhotoLoading) {
    return <Loader />;
  }

  if (imageBlob) {
    return (
      <Image
        onClick={onClick}
        src={URL.createObjectURL(imageBlob)}
        alt="Avatar"
        className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
      />
    );
  }

  return (
    <Avatar
      color={color}
      name={avatarFallbackName}
      src={profilePhoto?.data.securePhotoUrl}
      size={size}
      round={round}
      onClick={onClick}
      className={onClick ? `cursor-pointer ${className}` : `${className}`}
      textSizeRatio={2}
    />
  );
};

export default UserAvatar;
