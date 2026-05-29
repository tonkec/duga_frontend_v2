import { ALLOWED_IMAGE_MIME_TYPES } from './consts';
import { getEnv } from '@app/configs/env';

const YOUTUBE_VIDEO_ID_REGEX = /^[\w-]{11}$/;

const ALLOWED_REMOTE_IMAGE_HOSTS = new Set([
  'm.media-amazon.com',
  'media.giphy.com',
  'media0.giphy.com',
  'media1.giphy.com',
  'media2.giphy.com',
  'media3.giphy.com',
  'media4.giphy.com',
  'i.giphy.com',
  'i.ytimg.com',
]);

const DUGA_S3_IMAGE_HOST = 'duga-user-photo.s3.eu-north-1.amazonaws.com';
const isAllowedRemoteImageHost = (hostname: string) => ALLOWED_REMOTE_IMAGE_HOSTS.has(hostname);
const LOCAL_BACKEND_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const BACKEND_MEDIA_PATH_REGEX = /^\/?(?:uploads|chat)\/[^\s]+$/i;
const S3_OBJECT_KEY_PATH_REGEX =
  /^\/?(?:development|staging|production)\/(?:user|chat|forum)\/[^\s\\]+$/i;
const URL_SCHEME_REGEX = /^[a-z][a-z\d+\-.]*:/i;

const normalizeMimeType = (value: string | null | undefined) =>
  value?.split(';')[0]?.trim().toLowerCase() ?? '';

export const isAllowedRasterImageMimeType = (value: string | null | undefined) =>
  ALLOWED_IMAGE_MIME_TYPES.includes(normalizeMimeType(value));

const getConfiguredBackendOrigin = () => {
  const baseUrl = getEnv('VITE_BASE_URL');
  if (!baseUrl) return '';

  try {
    return new URL(baseUrl).origin;
  } catch {
    return '';
  }
};

const isTrustedBackendUrl = (url: URL) =>
  (url.protocol === 'http:' || url.protocol === 'https:') &&
  (LOCAL_BACKEND_HOSTS.has(url.hostname) || url.origin === getConfiguredBackendOrigin());

const getSafeBackendPathFromAbsoluteUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (!isTrustedBackendUrl(url)) return '';

    const pathname = url.pathname;
    const decodedPathname = decodeURIComponent(pathname);
    if (
      pathname.includes('\\') ||
      decodedPathname.includes('\\') ||
      decodedPathname.includes('..') ||
      !BACKEND_MEDIA_PATH_REGEX.test(pathname)
    ) {
      return '';
    }

    return pathname;
  } catch {
    return '';
  }
};

export const getSafeBackendMediaPath = (value: string | null | undefined) => {
  if (!value) return '';

  const trimmedValue = value.trim();
  if (URL_SCHEME_REGEX.test(trimmedValue)) {
    return getSafeBackendPathFromAbsoluteUrl(trimmedValue);
  }

  if (
    !trimmedValue ||
    trimmedValue.startsWith('//') ||
    trimmedValue.includes('\\') ||
    !BACKEND_MEDIA_PATH_REGEX.test(trimmedValue)
  ) {
    return '';
  }

  return `/${trimmedValue.replace(/^\/+/, '')}`;
};

export const getSafeS3BackendMediaPath = (value: string | null | undefined) => {
  if (!value) return '';

  const trimmedValue = value.trim();
  if (!URL_SCHEME_REGEX.test(trimmedValue)) {
    if (
      trimmedValue.startsWith('//') ||
      trimmedValue.includes('\\') ||
      trimmedValue.includes('..') ||
      !S3_OBJECT_KEY_PATH_REGEX.test(trimmedValue)
    ) {
      return '';
    }

    return `/uploads/files/${trimmedValue.replace(/^\/+/, '')}`;
  }

  try {
    const url = new URL(trimmedValue);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== DUGA_S3_IMAGE_HOST ||
      !S3_OBJECT_KEY_PATH_REGEX.test(url.pathname) ||
      url.pathname.includes('..')
    ) {
      return '';
    }

    return `/uploads/files${url.pathname}`;
  } catch {
    return '';
  }
};

export const getSafeRemoteImageUrl = (value: string | null | undefined) => {
  if (!value) return '';

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !isAllowedRemoteImageHost(url.hostname)) {
      return '';
    }

    return url.toString();
  } catch {
    return '';
  }
};

export const isAllowedRemoteImageUrl = (value: string | null | undefined) =>
  Boolean(getSafeRemoteImageUrl(value));

export const getSafeYouTubeEmbedUrl = (videoId: string | null | undefined) => {
  if (!videoId || !YOUTUBE_VIDEO_ID_REGEX.test(videoId)) return '';

  return `https://www.youtube-nocookie.com/embed/${videoId}`;
};

export const getSafeGiphyEmbedUrl = (giphyId: string | null | undefined) => {
  if (!giphyId || !/^[\w-]+$/.test(giphyId)) return '';

  return `https://giphy.com/embed/${giphyId}`;
};
