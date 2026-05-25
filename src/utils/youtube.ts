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
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
      const embedMatch = url.pathname.match(/^\/embed\/([\w-]{11})/);
      if (embedMatch?.[1]) return `https://www.youtube.com/embed/${embedMatch[1]}`;

      const videoId = url.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    return null;
  } catch {
    return null;
  }
};
