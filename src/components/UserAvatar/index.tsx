import Avatar from 'react-avatar';
import clsx from 'clsx';
import { useGetProfilePhoto } from './hooks/useGetProfilePhoto';
import Loader from '../Loader';
import { useGetImageBlob } from '../LatestUploads/hooks';
import Image from '../Image';
import { getStoredThemePreference } from '@app/hooks/useThemePreference';
import { useObjectUrl } from '@app/hooks/useObjectUrl';
import type { IImage } from '../Photos';

interface IUserAvatarProps {
  avatarFallbackName: string;
  color: string;
  onClick?: () => void;
  userId: string | undefined;
  size?: string;
  round?: boolean;
  className?: string;
  fgColor?: string;
  profilePhoto?: Partial<IImage>;
}

const UserAvatar = ({
  avatarFallbackName,
  color,
  onClick,
  userId,
  size,
  className,
  fgColor,
  profilePhoto: profilePhotoOverride,
}: IUserAvatarProps) => {
  const { profilePhoto, isProfilePhotoLoading } = useGetProfilePhoto(userId || '');
  const resolvedProfilePhoto = profilePhotoOverride ?? profilePhoto?.data;
  const profilePhotoSources = [
    resolvedProfilePhoto?.securePhotoUrl,
    resolvedProfilePhoto?.url,
    resolvedProfilePhoto?.imageUrl,
    resolvedProfilePhoto?.messagePhotoUrl,
  ].filter((source): source is string => Boolean(source));
  const firstImageQuery = useGetImageBlob(profilePhotoSources[0] || '');
  const secondImageQuery = useGetImageBlob(profilePhotoSources[1] || '');
  const thirdImageQuery = useGetImageBlob(profilePhotoSources[2] || '');
  const fourthImageQuery = useGetImageBlob(profilePhotoSources[3] || '');
  const imageBlob = [firstImageQuery, secondImageQuery, thirdImageQuery, fourthImageQuery].find(
    (query) => query.data
  )?.data;
  const imageBlobUrl = useObjectUrl(imageBlob);
  const hasValidUserId = Boolean(userId && userId !== 'undefined' && userId !== 'null');
  const isDarkMode = getStoredThemePreference() === 'dark';
  const fallbackBackgroundColor = isDarkMode ? '#222831' : color;
  const fallbackTextColor = isDarkMode ? '#f8fafc' : fgColor || '#ffffff';
  const resolvedSize = size || '40';
  const cssSize = /^\d+(\.\d+)?$/.test(resolvedSize) ? `${resolvedSize}px` : resolvedSize;
  const sizeStyle = size || !className ? { width: cssSize, height: cssSize } : undefined;
  const containerClassName = clsx(
    'user-avatar inline-block overflow-hidden align-middle',
    onClick && 'cursor-pointer',
    className
  );

  const renderAvatar = () => {
    if (imageBlobUrl) {
      return (
        <Image
          src={imageBlobUrl}
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

  if (hasValidUserId && isProfilePhotoLoading && !profilePhotoOverride) {
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
