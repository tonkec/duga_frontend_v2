let accessTokenGetter: (() => Promise<string>) | null = null;
const LEGACY_API_TOKEN_KEY = 'dugaApiToken';

export const setAccessTokenGetter = (getter: () => Promise<string>) => {
  accessTokenGetter = getter;
};

export const clearAccessTokenGetter = () => {
  accessTokenGetter = null;
};

export const clearTokenCookie = () => {
  document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/`;
};

export const clearDugaApiToken = () => {
  localStorage.removeItem(LEGACY_API_TOKEN_KEY);
  clearTokenCookie();
};

export const resolveAuth0AccessToken = async (): Promise<string | null> => {
  if (!accessTokenGetter) return null;

  try {
    return await accessTokenGetter();
  } catch {
    return null;
  }
};
