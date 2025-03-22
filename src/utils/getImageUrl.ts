import { IImage } from '../components/Photos';
import { S3_BUCKET_URL } from './consts';

export const getImageUrl = (image: IImage) => {
  return `${S3_BUCKET_URL}/${image.url}`;
};
