export interface ImdbTitle {
  id: string;
  title: string;
  year?: string;
  imageUrl?: string;
  url: string;
}

type ImdbSearchItem = {
  id?: string;
  imdbId?: string;
  titleId?: string;
  tconst?: string;
  l?: string;
  title?: string;
  name?: string;
  primaryTitle?: string;
  titleText?: {
    text?: string;
  };
  y?: string | number;
  year?: string | number;
  releaseYear?: {
    year?: string | number;
  };
  i?: {
    imageUrl?: string;
  };
  imageUrl?: string;
  image?: {
    url?: string;
  };
  url?: string;
};

const getSearchResults = (data: unknown): ImdbSearchItem[] => {
  if (Array.isArray(data)) return data as ImdbSearchItem[];

  if (!data || typeof data !== 'object') return [];

  const response = data as {
    d?: ImdbSearchItem[];
    results?: ImdbSearchItem[];
    titles?: ImdbSearchItem[];
    searchResults?: ImdbSearchItem[];
    data?: {
      titles?: ImdbSearchItem[];
      search?: {
        titles?: ImdbSearchItem[];
      };
    };
  };

  return (
    response.d ||
    response.results ||
    response.titles ||
    response.searchResults ||
    response.data?.titles ||
    response.data?.search?.titles ||
    []
  );
};

const normalizeImdbTitle = (item: ImdbSearchItem): ImdbTitle | null => {
  const id = item.id || item.imdbId || item.titleId || item.tconst;
  const title = item.l || item.title || item.name || item.primaryTitle || item.titleText?.text;

  if (!id?.startsWith('tt') || !title) return null;

  const year = item.y || item.year || item.releaseYear?.year;

  return {
    id,
    title,
    year: year ? String(year) : undefined,
    imageUrl: item.i?.imageUrl || item.imageUrl || item.image?.url,
    url: item.url || `https://www.imdb.com/title/${id}/`,
  };
};

const getSuggestionUrl = (query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  const firstCharacter = normalizedQuery.match(/[a-z0-9]/)?.[0] || 'a';

  return `https://v3.sg.media-imdb.com/suggestion/${firstCharacter}/${encodeURIComponent(
    normalizedQuery
  )}.json`;
};

export const searchImdbTitles = async (query: string): Promise<ImdbTitle[]> => {
  const response = await fetch(getSuggestionUrl(query), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('IMDb pretraga trenutno nije dostupna.');
  }

  const data = await response.json();

  return getSearchResults(data).map(normalizeImdbTitle).filter(Boolean) as ImdbTitle[];
};
