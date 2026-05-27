const YOUTUBE_VIDEO_ID_REGEX = /^[\w-]{11}$/;

const ALLOWED_REMOTE_IMAGE_HOSTS = new Set([
  'duga-user-photo.s3.eu-north-1.amazonaws.com',
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

const isAllowedRemoteImageHost = (hostname: string) => ALLOWED_REMOTE_IMAGE_HOSTS.has(hostname);

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
