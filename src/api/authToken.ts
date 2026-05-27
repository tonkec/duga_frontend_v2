let accessTokenGetter: (() => Promise<string>) | null = null;

export const setAccessTokenGetter = (getter: () => Promise<string>) => {
  accessTokenGetter = getter;
};

export const clearAccessTokenGetter = () => {
  accessTokenGetter = null;
};

export const resolveAuth0AccessToken = async (): Promise<string | null> => {
  if (!accessTokenGetter) return null;

  try {
    return await accessTokenGetter();
  } catch {
    return null;
  }
};
