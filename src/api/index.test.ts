import { apiClient } from '.';
import { SESSION_HEADER } from './appSession';
import { clearAccessTokenGetter, clearDugaApiToken } from './authToken';

describe('apiClient URL safety', () => {
  beforeEach(() => {
    clearAccessTokenGetter();
    clearDugaApiToken();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    clearAccessTokenGetter();
    clearDugaApiToken();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('rejects absolute request URLs before sending a request', async () => {
    const adapter = jest.fn();

    await expect(
      apiClient('api-token').get('https://example.com/uploads/photo.png', { adapter })
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: { message: 'Absolute API request URLs are not allowed' },
      },
    });

    expect(adapter).not.toHaveBeenCalled();
  });

  it('rejects protocol-relative request URLs before sending a request', async () => {
    const adapter = jest.fn();

    await expect(
      apiClient('api-token').get('//example.com/uploads/photo.png', { adapter })
    ).rejects.toMatchObject({
      response: {
        status: 400,
        data: { message: 'Absolute API request URLs are not allowed' },
      },
    });

    expect(adapter).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated requests before sending them', async () => {
    const adapter = jest.fn();

    await expect(apiClient().get('/users/current-user', { adapter })).rejects.toMatchObject({
      response: {
        status: 401,
        data: { message: 'Not authenticated: token missing' },
      },
    });

    expect(adapter).not.toHaveBeenCalled();
  });

  it('omits the session header until the backend has issued a session id', async () => {
    const adapter = jest.fn(async (config) => ({
      config,
      data: {},
      headers: {},
      status: 200,
      statusText: 'OK',
    }));

    await apiClient('api-token').get('/users/current-user', { adapter });

    const headers = adapter.mock.calls[0][0].headers;
    expect(headers.Authorization).toBe('Bearer api-token');
    expect(headers[SESSION_HEADER]).toBeUndefined();
    expect(localStorage.getItem('dugaSessionId')).toBeNull();
  });

  it('attaches only the server-issued session id from sessionStorage', async () => {
    localStorage.setItem('dugaSessionId', 'legacy-browser-session-id');
    sessionStorage.setItem('dugaSessionId', 'server-session-id');
    const adapter = jest.fn(async (config) => ({
      config,
      data: {},
      headers: {},
      status: 200,
      statusText: 'OK',
    }));

    await apiClient('api-token').get('/users/current-user', { adapter });

    const headers = adapter.mock.calls[0][0].headers;
    expect(headers[SESSION_HEADER]).toBe('server-session-id');
    expect(localStorage.getItem('dugaSessionId')).toBeNull();
  });
});
