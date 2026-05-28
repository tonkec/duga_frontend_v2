import { getSafeYouTubeEmbedUrl } from './mediaSafety';

const YOUTUBE_HOSTS = ['www.youtube.com', 'youtube.com', 'youtu.be'];

export const isYouTubeUrl = (value: string) => {
  try {
    const url = new URL(value);
    return YOUTUBE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
};

export const getYouTubeEmbedUrl = (value: string) => {
  try {
    const url = new URL(value);

    if (url.hostname === 'youtu.be') {
      const videoId = url.pathname.split('/').filter(Boolean)[0];
      return getSafeYouTubeEmbedUrl(videoId) || null;
    }

    if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
      const embedMatch = url.pathname.match(/^\/embed\/([\w-]{11})/);
      if (embedMatch?.[1]) return getSafeYouTubeEmbedUrl(embedMatch[1]) || null;

      const videoId = url.searchParams.get('v');
      if (videoId) return getSafeYouTubeEmbedUrl(videoId) || null;
    }

    return null;
  } catch {
    return null;
  }
};
