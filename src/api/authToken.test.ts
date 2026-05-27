import { clearAccessTokenGetter, resolveAuth0AccessToken, setAccessTokenGetter } from './authToken';

describe('resolveAuth0AccessToken', () => {
  beforeEach(() => {
    clearAccessTokenGetter();
  });

  afterEach(() => {
    clearAccessTokenGetter();
  });

  it('uses the Auth0 token getter', async () => {
    setAccessTokenGetter(async () => 'fresh-auth0-token');

    await expect(resolveAuth0AccessToken()).resolves.toBe('fresh-auth0-token');
  });

  it('returns null when no Auth0 token getter is available', async () => {
    await expect(resolveAuth0AccessToken()).resolves.toBeNull();
  });

  it('stops using Auth0 after the token getter is cleared', async () => {
    setAccessTokenGetter(async () => 'auth0-token');
    clearAccessTokenGetter();

    await expect(resolveAuth0AccessToken()).resolves.toBeNull();
  });

  it('returns null when the Auth0 getter fails', async () => {
    setAccessTokenGetter(async () => {
      throw new Error('Auth0 unavailable');
    });

    await expect(resolveAuth0AccessToken()).resolves.toBeNull();
  });
});
