import Avatar from 'react-avatar';
import clsx from 'clsx';
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
  fgColor?: string;
}

const UserAvatar = ({
  avatarFallbackName,
  color,
  onClick,
  userId,
  size,
  className,
  fgColor,
}: IUserAvatarProps) => {
  const { profilePhoto, isProfilePhotoLoading } = useGetProfilePhoto(userId || '');
  const { data: imageBlob } = useGetImageBlob(profilePhoto?.data.securePhotoUrl);
  const resolvedSize = size || '40';
  const cssSize = /^\d+(\.\d+)?$/.test(resolvedSize) ? `${resolvedSize}px` : resolvedSize;
  const sizeStyle = size || !className ? { width: cssSize, height: cssSize } : undefined;
  const containerClassName = clsx(
    'inline-block overflow-hidden align-middle',
    onClick && 'cursor-pointer',
    className
  );

  const renderAvatar = () => {
    if (imageBlob) {
      return (
        <Image
          src={URL.createObjectURL(imageBlob)}
          alt="Avatar"
          className={clsx('h-full w-full object-cover', className)}
        />
      );
    }

    return (
      <Avatar
        color={color}
        src={
          profilePhoto?.data.securePhotoUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarFallbackName)}&background=f7f9ff`
        }
        size={className ? '100%' : resolvedSize}
        round={false}
        textSizeRatio={2}
        fgColor={fgColor || '#fff'}
      />
    );
  };

  if (isProfilePhotoLoading) {
    return (
      <div className={containerClassName} style={sizeStyle}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={containerClassName} style={sizeStyle} onClick={onClick}>
      {renderAvatar()}
    </div>
  );
};

export default UserAvatar;
