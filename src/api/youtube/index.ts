import { getEnv } from '@app/configs/env';

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl?: string;
  url: string;
}

type YouTubeSearchItem = {
  id?: {
    kind?: string;
    videoId?: string;
  };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: {
      default?: {
        url?: string;
      };
      medium?: {
        url?: string;
      };
      high?: {
        url?: string;
      };
    };
  };
};

type YouTubeSearchResponse = {
  items?: YouTubeSearchItem[];
};

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const normalizeYouTubeVideo = (item: YouTubeSearchItem): YouTubeVideo | null => {
  const videoId = item.id?.videoId;
  const title = item.snippet?.title;

  if (item.id?.kind !== 'youtube#video' || !videoId || !title) return null;

  return {
    id: videoId,
    title: decodeHtmlEntities(title),
    channelTitle: decodeHtmlEntities(item.snippet?.channelTitle || ''),
    thumbnailUrl:
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.default?.url,
    url: `https://www.youtube.com/embed/${videoId}`,
  };
};

export const searchYouTubeVideos = async (query: string): Promise<YouTubeVideo[]> => {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) return [];

  const apiKey = getEnv('VITE_YOUTUBE_API_KEY');

  if (!apiKey) {
    throw new Error('YouTube API ključ nije konfiguriran.');
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: normalizedQuery,
    maxResults: '10',
    type: 'video',
    videoEmbeddable: 'true',
    safeSearch: 'moderate',
    key: apiKey,
  });

  const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('YouTube pretraga trenutno nije dostupna.');
  }

  const data = (await response.json()) as YouTubeSearchResponse;

  return (data.items || []).map(normalizeYouTubeVideo).filter(Boolean) as YouTubeVideo[];
};
