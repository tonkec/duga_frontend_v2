import avatar from '../assets/avatar.svg';
import { IImage } from '../components/Photos';
export const REACT_APP_S3_BUCKET_URL = 'https://duga-user-photo.s3.eu-north-1.amazonaws.com';

export const getProfilePhotoUrl = (profilePhoto: IImage | undefined) => {
  if (profilePhoto) {
    return `${REACT_APP_S3_BUCKET_URL}/${profilePhoto.url}`;
  }

  return avatar;
};

export const getProfilePhoto = (allImages: IImage[] | undefined) => {
  return allImages?.find((image: IImage) => image.isProfilePhoto);
};
