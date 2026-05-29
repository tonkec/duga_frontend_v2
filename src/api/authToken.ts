let accessTokenGetter: (() => Promise<string>) | null = null;
const AUTH0_ACCESS_TOKEN_KEY = 'dugaAuth0AccessToken';

const getCachedAccessToken = () => {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(AUTH0_ACCESS_TOKEN_KEY);
};

const setCachedAccessToken = (token: string) => {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(AUTH0_ACCESS_TOKEN_KEY, token);
};

export const setAccessTokenGetter = (getter: () => Promise<string>) => {
  accessTokenGetter = getter;
};

export const clearAccessTokenGetter = () => {
  accessTokenGetter = null;
};

export const clearCachedAccessToken = () => {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(AUTH0_ACCESS_TOKEN_KEY);
};

export const resolveAuth0AccessToken = async (): Promise<string | null> => {
  if (!accessTokenGetter) return getCachedAccessToken();

  try {
    const token = await accessTokenGetter();
    setCachedAccessToken(token);
    return token;
  } catch {
    return getCachedAccessToken();
  }
};
