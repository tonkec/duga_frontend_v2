import type { IImage } from '@app/components/Photos';
import {
  getSafeBackendMediaPath,
  getSafeRemoteImageUrl,
  getSafeS3BackendMediaPath,
} from '@app/utils/mediaSafety';
import type { ForumUser } from '../types/forum.types';

const getRenderableImageSource = (value: string | null | undefined) => {
  if (!value) return '';

  return (
    getSafeBackendMediaPath(value) ||
    getSafeS3BackendMediaPath(value) ||
    getSafeRemoteImageUrl(value)
  );
};

export const getForumUserAvatarProfilePhoto = (
  user: ForumUser | null | undefined
): Partial<IImage> | undefined => {
  const imageSource =
    getRenderableImageSource(user?.picture) ||
    getRenderableImageSource(user?.avatar) ||
    getRenderableImageSource(user?.securePhotoUrl) ||
    getRenderableImageSource(user?.imageUrl) ||
    getRenderableImageSource(user?.url) ||
    getRenderableImageSource(user?.profilePhoto?.securePhotoUrl) ||
    getRenderableImageSource(user?.profilePhoto?.imageUrl) ||
    getRenderableImageSource(user?.profilePhoto?.url);

  if (!imageSource) {
    return undefined;
  }

  return {
    securePhotoUrl: imageSource,
    imageUrl: imageSource,
    url: imageSource,
  };
};
