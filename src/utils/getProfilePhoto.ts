import { IImage } from '@app/components/Photos';

export const getProfilePhotoUrl = (profilePhoto: IImage | undefined) => {
  return profilePhoto?.securePhotoUrl || '';
};

export const getProfilePhoto = (allImages: IImage[] | undefined) => {
  return allImages?.find((image: IImage) => image.isProfilePhoto);
};
