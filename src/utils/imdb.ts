export const formatImdbTitleUrl = (id: string) => `https://www.imdb.com/title/${id}/`;

export const getImdbTitleId = (value?: string | null) => {
  if (!value) return null;

  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  if (/^tt\d+$/.test(trimmedValue)) {
    return trimmedValue;
  }

  try {
    const url = new URL(trimmedValue, 'https://www.imdb.com');
    const titleMatch = url.pathname.match(/^\/title\/(tt\d+)\/?/);
    const isImdbHost = ['www.imdb.com', 'imdb.com', 'm.imdb.com'].includes(url.hostname);

    if (!isImdbHost || !titleMatch?.[1]) return null;

    return titleMatch[1];
  } catch {
    return null;
  }
};

export const getImdbTitleUrl = (value?: string | null) => {
  const titleId = getImdbTitleId(value);
  return titleId ? formatImdbTitleUrl(titleId) : null;
};

export const isImdbTitleUrl = (value?: string | null) => getImdbTitleUrl(value) !== null;
