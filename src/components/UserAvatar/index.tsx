import Avatar from 'react-avatar';
import clsx from 'clsx';
import { useGetProfilePhoto } from './hooks/useGetProfilePhoto';
import Loader from '../Loader';
import { useGetImageBlob } from '../LatestUploads/hooks';
import Image from '../Image';
import { getStoredThemePreference } from '@app/hooks/useThemePreference';

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
  const isDarkMode = getStoredThemePreference() === 'dark';
  const fallbackBackgroundColor = isDarkMode ? '#222831' : color;
  const fallbackTextColor = isDarkMode ? '#f8fafc' : fgColor || '#1f2937';
  const resolvedSize = size || '40';
  const cssSize = /^\d+(\.\d+)?$/.test(resolvedSize) ? `${resolvedSize}px` : resolvedSize;
  const sizeStyle = size || !className ? { width: cssSize, height: cssSize } : undefined;
  const containerClassName = clsx(
    'user-avatar inline-block overflow-hidden align-middle',
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
        color={fallbackBackgroundColor}
        size={className ? '100%' : resolvedSize}
        round={false}
        textSizeRatio={2}
        name={avatarFallbackName}
        fgColor={fallbackTextColor}
      />
    );
  };

  if (isProfilePhotoLoading) {
    return (
      <div className={containerClassName} style={sizeStyle}>
        <Loader variant="inline" size="sm" label="Učitavanje avatara..." />
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
