let accessTokenGetter: (() => Promise<string>) | null = null;
const API_TOKEN_KEY = 'dugaApiToken';

export const setAccessTokenGetter = (getter: () => Promise<string>) => {
  accessTokenGetter = getter;
};

export const clearAccessTokenGetter = () => {
  accessTokenGetter = null;
};

export const clearTokenCookie = () => {
  document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/`;
};

export const getDugaApiToken = () => localStorage.getItem(API_TOKEN_KEY);

export const setDugaApiToken = (token: string) => {
  localStorage.setItem(API_TOKEN_KEY, token);
};

export const clearDugaApiToken = () => {
  localStorage.removeItem(API_TOKEN_KEY);
};

export const resolveAuth0AccessToken = async (): Promise<string | null> => {
  if (!accessTokenGetter) return null;

  try {
    return await accessTokenGetter();
  } catch {
    return null;
  }
};

export const resolveAccessToken = async (explicitToken?: string): Promise<string | null> => {
  if (explicitToken) return explicitToken;

  const apiToken = getDugaApiToken();
  if (apiToken) return apiToken;

  if (accessTokenGetter) {
    return resolveAuth0AccessToken();
  }

  return getCookie('token');
};

const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
};
