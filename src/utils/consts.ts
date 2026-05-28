import { getEnv } from '@app/configs/env';

export const S3_URL = 'https://duga-user-photo.s3.eu-north-1.amazonaws.com';
export const S3_CHAT_PHOTO_ENVIRONMENT = getEnv('VITE_S3_ENVIRONMENT');
export const API_KEY = getEnv('VITE_GIPHY_API_KEY');
export const MAXIMUM_NUMBER_OF_IMAGES = 5;
export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
export const ALLOWED_FILE_TYPES = '.png,.jpg,.jpeg,.webp';
export const MAX_GROUP_CHAT_MEMBERS = 50;
