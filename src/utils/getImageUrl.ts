import { IImage } from '@app/components/Photos';
import { getSafeRemoteImageUrl } from './mediaSafety';

export const getImageUrl = (image: IImage) => {
  return (
    getSafeRemoteImageUrl(image.imageUrl) ||
    getSafeRemoteImageUrl(image.url) ||
    getSafeRemoteImageUrl(image.securePhotoUrl) ||
    getSafeRemoteImageUrl(image.messagePhotoUrl)
  );
};
