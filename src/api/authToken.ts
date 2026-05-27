let accessTokenGetter: (() => Promise<string>) | null = null;
const LEGACY_API_TOKEN_KEY = 'dugaApiToken';
let dugaApiToken: string | null = null;

export const setAccessTokenGetter = (getter: () => Promise<string>) => {
  accessTokenGetter = getter;
};

export const clearAccessTokenGetter = () => {
  accessTokenGetter = null;
};

export const clearTokenCookie = () => {
  document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/`;
};

export const getDugaApiToken = () => dugaApiToken;

export const setDugaApiToken = (token: string) => {
  dugaApiToken = token;
};

export const clearDugaApiToken = () => {
  dugaApiToken = null;
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

export const resolveAccessToken = async (explicitToken?: string): Promise<string | null> => {
  if (explicitToken) return explicitToken;

  const apiToken = getDugaApiToken();
  if (apiToken) return apiToken;

  if (accessTokenGetter) {
    return resolveAuth0AccessToken();
  }

  return null;
};
