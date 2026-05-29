import {
  clearAccessTokenGetter,
  clearCachedAccessToken,
  resolveAuth0AccessToken,
  setAccessTokenGetter,
} from './authToken';

describe('resolveAuth0AccessToken', () => {
  beforeEach(() => {
    clearAccessTokenGetter();
    clearCachedAccessToken();
  });

  afterEach(() => {
    clearAccessTokenGetter();
    clearCachedAccessToken();
  });

  it('uses the Auth0 token getter', async () => {
    setAccessTokenGetter(async () => 'fresh-auth0-token');

    await expect(resolveAuth0AccessToken()).resolves.toBe('fresh-auth0-token');
  });

  it('returns null when no Auth0 token getter or session token is available', async () => {
    await expect(resolveAuth0AccessToken()).resolves.toBeNull();
  });

  it('falls back to the cached browser-session token after the getter is cleared', async () => {
    setAccessTokenGetter(async () => 'auth0-token');
    await expect(resolveAuth0AccessToken()).resolves.toBe('auth0-token');

    clearAccessTokenGetter();

    await expect(resolveAuth0AccessToken()).resolves.toBe('auth0-token');
  });

  it('falls back to the cached browser-session token when the Auth0 getter fails', async () => {
    setAccessTokenGetter(async () => 'cached-token');
    await expect(resolveAuth0AccessToken()).resolves.toBe('cached-token');

    setAccessTokenGetter(async () => {
      throw new Error('Auth0 unavailable');
    });

    await expect(resolveAuth0AccessToken()).resolves.toBe('cached-token');
  });

  it('clears the cached browser-session token', async () => {
    setAccessTokenGetter(async () => 'cached-token');
    await expect(resolveAuth0AccessToken()).resolves.toBe('cached-token');

    clearAccessTokenGetter();
    clearCachedAccessToken();

    await expect(resolveAuth0AccessToken()).resolves.toBeNull();
  });
});
