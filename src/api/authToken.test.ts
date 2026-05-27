import {
  clearAccessTokenGetter,
  clearDugaApiToken,
  resolveAuth0AccessToken,
  setAccessTokenGetter,
} from './authToken';

const clearCookie = () => {
  document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/`;
};

describe('resolveAuth0AccessToken', () => {
  beforeEach(() => {
    clearAccessTokenGetter();
    clearDugaApiToken();
    clearCookie();
  });

  afterEach(() => {
    clearAccessTokenGetter();
    clearDugaApiToken();
    clearCookie();
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

  it('does not reuse a legacy cookie token when the Auth0 getter fails', async () => {
    document.cookie = `token=${encodeURIComponent('cookie-token')};path=/`;
    setAccessTokenGetter(async () => {
      throw new Error('Auth0 unavailable');
    });

    await expect(resolveAuth0AccessToken()).resolves.toBeNull();
  });

  it('clears legacy browser-stored tokens', () => {
    localStorage.setItem('dugaApiToken', 'legacy-local-storage-token');
    document.cookie = `token=${encodeURIComponent('legacy-cookie-token')};path=/`;

    clearDugaApiToken();

    expect(localStorage.getItem('dugaApiToken')).toBeNull();
    expect(document.cookie).not.toContain('token=');
  });
});
