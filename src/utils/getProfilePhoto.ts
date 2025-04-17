import { IImage } from '@app/components/Photos';
import { S3_URL } from './consts';
export const getProfilePhotoUrl = (profilePhoto: IImage | undefined) => {
  if (profilePhoto) {
    return `${S3_URL}/${profilePhoto.url}`;
  }
  return '';
};

export const getProfilePhoto = (allImages: IImage[] | undefined) => {
  return allImages?.find((image: IImage) => image.isProfilePhoto);
};
