import {
  clearAccessTokenGetter,
  clearDugaApiToken,
  resolveAccessToken,
  setAccessTokenGetter,
  setDugaApiToken,
} from './authToken';

const setCookie = (value: string) => {
  document.cookie = `token=${encodeURIComponent(value)};path=/`;
};

const clearCookie = () => {
  document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/`;
};

describe('resolveAccessToken', () => {
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

  it('uses an explicit token first', async () => {
    setCookie('cookie-token');
    setAccessTokenGetter(async () => 'auth0-token');

    await expect(resolveAccessToken('explicit-token')).resolves.toBe('explicit-token');
  });

  it('prefers the backend API token over Auth0 and cookie tokens', async () => {
    setCookie('cookie-token');
    setAccessTokenGetter(async () => 'auth0-token');
    setDugaApiToken('duga-api-token');

    await expect(resolveAccessToken()).resolves.toBe('duga-api-token');
  });

  it('uses the Auth0 token getter when there is no backend API token', async () => {
    setCookie('stale-cookie-token');
    setAccessTokenGetter(async () => 'fresh-auth0-token');

    await expect(resolveAccessToken()).resolves.toBe('fresh-auth0-token');
  });

  it('does not reuse a cookie token when the Auth0 getter fails', async () => {
    setCookie('cookie-token');
    setAccessTokenGetter(async () => {
      throw new Error('Auth0 unavailable');
    });

    await expect(resolveAccessToken()).resolves.toBeNull();
  });
});
