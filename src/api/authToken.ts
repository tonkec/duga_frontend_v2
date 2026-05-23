let accessTokenGetter: (() => Promise<string>) | null = null;

export const setAccessTokenGetter = (getter: () => Promise<string>) => {
  accessTokenGetter = getter;
};

export const clearAccessTokenGetter = () => {
  accessTokenGetter = null;
};

export const resolveAccessToken = async (explicitToken?: string): Promise<string | null> => {
  if (explicitToken) return explicitToken;

  const cookieToken = getCookie('token');
  if (cookieToken) return cookieToken;

  if (!accessTokenGetter) return null;

  try {
    return await accessTokenGetter();
  } catch {
    return null;
  }
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
