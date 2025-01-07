import { IImage } from '../components/Photos';
import { REACT_APP_S3_BUCKET_URL } from './consts';
export const getProfilePhotoUrl = (profilePhoto: IImage | undefined) => {
  if (profilePhoto) {
    return `${REACT_APP_S3_BUCKET_URL}/${profilePhoto.url}`;
  }
  return '';
};

export const getProfilePhoto = (allImages: IImage[] | undefined) => {
  return allImages?.find((image: IImage) => image.isProfilePhoto);
};
