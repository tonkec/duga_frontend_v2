import { IImage } from '../components/Photos';
import { S3_URL } from './consts';

export const getPhotoUrl = (photo: IImage | undefined) => {
  if (!photo) {
    return '';
  }
  return `${S3_URL}/${photo.url}`;
};
