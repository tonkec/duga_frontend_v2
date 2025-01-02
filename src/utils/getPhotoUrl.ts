import { IImage } from '../components/Photos';
import { REACT_APP_S3_BUCKET_URL } from './consts';

export const getPhotoUrl = (photo: IImage | undefined) => {
  if (!photo) {
    return '';
  }
  return `${REACT_APP_S3_BUCKET_URL}/${photo.url}`;
};
