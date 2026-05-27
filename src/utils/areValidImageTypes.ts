import { ALLOWED_IMAGE_MIME_TYPES } from './consts';

export const areValidImageTypes = (files: FileList): boolean => {
  return Array.from(files).every((file) => ALLOWED_IMAGE_MIME_TYPES.includes(file.type));
};
