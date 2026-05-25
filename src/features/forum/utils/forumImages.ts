import { S3_URL } from '@app/utils/consts';
import type { Answer, Question } from '../types/forum.types';

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

export interface ForumImageItem {
  imageUrl?: string | null;
  securePhotoUrl?: string | null;
}

export const getForumImageUrl = (securePhotoUrl?: string | null, imageUrl?: string | null) => {
  const imageSource = securePhotoUrl && isAbsoluteUrl(securePhotoUrl) ? securePhotoUrl : imageUrl;

  if (!imageSource) {
    return '';
  }

  if (isAbsoluteUrl(imageSource)) {
    return imageSource;
  }

  return `${S3_URL}/${imageSource.replace(/^\/+/, '')}`;
};

export const getForumImageItems = (item: Pick<
  Answer | Question,
  'imageUrl' | 'imageUrls' | 'securePhotoUrl' | 'securePhotoUrls'
>): ForumImageItem[] => {
  const securePhotoUrls = item.securePhotoUrls ?? [];
  const imageUrls = item.imageUrls ?? [];
  const maxLength = Math.max(securePhotoUrls.length, imageUrls.length);
  const items: ForumImageItem[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    items.push({
      securePhotoUrl: securePhotoUrls[index] ?? null,
      imageUrl: imageUrls[index] ?? null,
    });
  }

  if (item.securePhotoUrl || item.imageUrl) {
    items.unshift({
      securePhotoUrl: item.securePhotoUrl,
      imageUrl: item.imageUrl,
    });
  }

  return items.filter((imageItem) => imageItem.securePhotoUrl || imageItem.imageUrl);
};
