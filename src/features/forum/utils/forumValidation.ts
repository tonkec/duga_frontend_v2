import { ALLOWED_FILE_TYPES, ALLOWED_IMAGE_MIME_TYPES } from '@app/utils/consts';

export const FORUM_MAX_IMAGE_COUNT = 5;
export const FORUM_MAX_IMAGE_SIZE_BYTES = 1024 * 1024;
export const FORUM_MAX_BODY_LENGTH = 2000;
export const FORUM_ALLOWED_IMAGE_TYPES = ALLOWED_FILE_TYPES;

export const validateForumImages = (images: File[], existingImageCount = 0) => {
  const totalImageCount = existingImageCount + images.length;

  if (totalImageCount > FORUM_MAX_IMAGE_COUNT) {
    const remainingImageCount = Math.max(0, FORUM_MAX_IMAGE_COUNT - existingImageCount);
    if (existingImageCount === 0) {
      return `Možeš dodati najviše ${FORUM_MAX_IMAGE_COUNT} slika.`;
    }

    return `Ukupno možeš imati najviše ${FORUM_MAX_IMAGE_COUNT} slika. Trenutno imaš ${existingImageCount}, možeš dodati još ${remainingImageCount}.`;
  }

  const nonImageFile = images.find((image) => !ALLOWED_IMAGE_MIME_TYPES.includes(image.type));
  if (nonImageFile) {
    return `Možeš dodati samo slike u formatima: ${FORUM_ALLOWED_IMAGE_TYPES}.`;
  }

  const oversizedImage = images.find((image) => image.size > FORUM_MAX_IMAGE_SIZE_BYTES);
  if (oversizedImage) {
    return 'Svaka slika može imati najviše 1 MB.';
  }

  return '';
};
