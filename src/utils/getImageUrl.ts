import { IImage } from '../components/Photos';
import { REACT_APP_S3_BUCKET_URL } from './consts';

export const getImageUrl = (image: IImage) => {
  return `${REACT_APP_S3_BUCKET_URL}/${image.url}`;
};
