import { IImage } from '../components/Photos';
import { S3_BUCKET_URL } from './consts';

export const getPhotoUrl = (photo: IImage | undefined) => {
  if (!photo) {
    return '';
  }
  return `${S3_BUCKET_URL}/${photo.url}`;
};
