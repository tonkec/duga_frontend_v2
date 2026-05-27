import { apiClient } from '.';
import {
  clearAccessTokenGetter,
  clearDugaApiToken,
  getDugaApiToken,
  setAccessTokenGetter,
} from './authToken';
import { SESSION_HEADER } from './appSession';
import { startSession } from './sessions';

jest.mock('.', () => ({
  apiClient: jest.fn(),
}));

const mockApiClient = jest.mocked(apiClient);
const post = jest.fn();

describe('startSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    clearAccessTokenGetter();
    clearDugaApiToken();
    mockApiClient.mockReturnValue({ post } as unknown as ReturnType<typeof apiClient>);
    post.mockResolvedValue({ data: { token: 'backend-api-token' } });
  });

  afterEach(() => {
    clearAccessTokenGetter();
    clearDugaApiToken();
    localStorage.clear();
  });

  it('starts a backend session with the Auth0 token and stored session id', async () => {
    localStorage.setItem('dugaSessionId', 'existing-session-id');
    setAccessTokenGetter(async () => 'auth0-access-token');

    await startSession();

    expect(mockApiClient).toHaveBeenCalledWith('auth0-access-token');
    expect(post).toHaveBeenCalledWith(
      '/sessions/start',
      { sessionId: 'existing-session-id' },
      {
        headers: {
          Authorization: 'Bearer auth0-access-token',
          [SESSION_HEADER]: 'existing-session-id',
        },
      }
    );
    expect(getDugaApiToken()).toBe('backend-api-token');
    expect(localStorage.getItem('dugaApiToken')).toBeNull();
  });

  it('creates and reuses a session id when none exists', async () => {
    setAccessTokenGetter(async () => 'auth0-access-token');

    await startSession();

    const sessionId = localStorage.getItem('dugaSessionId');
    expect(sessionId).toEqual(expect.any(String));
    expect(post).toHaveBeenCalledWith(
      '/sessions/start',
      { sessionId },
      {
        headers: {
          Authorization: 'Bearer auth0-access-token',
          [SESSION_HEADER]: sessionId,
        },
      }
    );
  });
});
