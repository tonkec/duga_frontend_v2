import { apiClient } from '.';
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

  it('sends API requests with credentials and no session header', async () => {
    const adapter = jest.fn(async (config) => ({
      config,
      data: {},
      headers: {},
      status: 200,
      statusText: 'OK',
    }));

    await apiClient().get('/users/current-user', { adapter });

    const config = adapter.mock.calls[0][0];
    const headers = adapter.mock.calls[0][0].headers;
    expect(config.withCredentials).toBe(true);
    expect(headers.Authorization).toBeUndefined();
    expect(headers['x-duga-session-id']).toBeUndefined();
  });

  it('does not attach legacy browser-stored session ids', async () => {
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
    expect(headers.Authorization).toBe('Bearer api-token');
    expect(headers['x-duga-session-id']).toBeUndefined();
  });

  it('attaches a CSRF header for unsafe methods when the CSRF cookie exists', async () => {
    document.cookie = `duga_csrf=${encodeURIComponent('csrf-token')};path=/`;
    const adapter = jest.fn(async (config) => ({
      config,
      data: {},
      headers: {},
      status: 200,
      statusText: 'OK',
    }));

    await apiClient().post('/users/update-user', {}, { adapter });

    const headers = adapter.mock.calls[0][0].headers;
    expect(headers['x-csrf-token']).toBe('csrf-token');

    document.cookie = 'duga_csrf=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  });
});
