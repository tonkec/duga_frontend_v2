import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_FILE_SIZE_BYTES } from './consts';

export const areValidImageTypes = (files: FileList): boolean => {
  return Array.from(files).every(
    (file) => ALLOWED_IMAGE_MIME_TYPES.includes(file.type) && file.size <= MAX_IMAGE_FILE_SIZE_BYTES
  );
};
