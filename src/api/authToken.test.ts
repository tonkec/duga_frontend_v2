import {
  clearAccessTokenGetter,
  clearDugaApiToken,
  getDugaApiToken,
  resolveAccessToken,
  setAccessTokenGetter,
  setDugaApiToken,
} from './authToken';

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
    setAccessTokenGetter(async () => 'auth0-token');

    await expect(resolveAccessToken('explicit-token')).resolves.toBe('explicit-token');
  });

  it('prefers the in-memory backend API token over Auth0', async () => {
    setAccessTokenGetter(async () => 'auth0-token');
    setDugaApiToken('duga-api-token');

    await expect(resolveAccessToken()).resolves.toBe('duga-api-token');
    expect(getDugaApiToken()).toBe('duga-api-token');
    expect(localStorage.getItem('dugaApiToken')).toBeNull();
  });

  it('uses the Auth0 token getter when there is no backend API token', async () => {
    setAccessTokenGetter(async () => 'fresh-auth0-token');

    await expect(resolveAccessToken()).resolves.toBe('fresh-auth0-token');
  });

  it('returns null when no explicit, backend, or Auth0 token is available', async () => {
    await expect(resolveAccessToken()).resolves.toBeNull();
  });

  it('does not call the Auth0 getter when an explicit token is provided', async () => {
    const getter = jest.fn(async () => 'auth0-token');
    setAccessTokenGetter(getter);

    await expect(resolveAccessToken('explicit-token')).resolves.toBe('explicit-token');

    expect(getter).not.toHaveBeenCalled();
  });

  it('does not call the Auth0 getter when a backend API token exists', async () => {
    const getter = jest.fn(async () => 'auth0-token');
    setAccessTokenGetter(getter);
    setDugaApiToken('duga-api-token');

    await expect(resolveAccessToken()).resolves.toBe('duga-api-token');

    expect(getter).not.toHaveBeenCalled();
  });

  it('stops using Auth0 after the token getter is cleared', async () => {
    setAccessTokenGetter(async () => 'auth0-token');
    clearAccessTokenGetter();

    await expect(resolveAccessToken()).resolves.toBeNull();
  });

  it('does not reuse a legacy cookie token when the Auth0 getter fails', async () => {
    document.cookie = `token=${encodeURIComponent('cookie-token')};path=/`;
    setAccessTokenGetter(async () => {
      throw new Error('Auth0 unavailable');
    });

    await expect(resolveAccessToken()).resolves.toBeNull();
  });

  it('clears legacy browser-stored tokens', () => {
    localStorage.setItem('dugaApiToken', 'legacy-local-storage-token');
    document.cookie = `token=${encodeURIComponent('legacy-cookie-token')};path=/`;
    setDugaApiToken('in-memory-token');

    clearDugaApiToken();

    expect(getDugaApiToken()).toBeNull();
    expect(localStorage.getItem('dugaApiToken')).toBeNull();
    expect(document.cookie).not.toContain('token=');
  });
});
