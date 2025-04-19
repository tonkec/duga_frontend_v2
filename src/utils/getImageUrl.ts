import { IImage } from '@app/components/Photos';
import { S3_URL } from './consts';

export const getImageUrl = (image: IImage) => {
  return `${S3_URL}/${image.url}`;
};
