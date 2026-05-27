import { apiClient } from '.';
import { clearAccessTokenGetter, clearDugaApiToken, setAccessTokenGetter } from './authToken';
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
    sessionStorage.clear();
    clearAccessTokenGetter();
    clearDugaApiToken();
    mockApiClient.mockReturnValue({ post } as unknown as ReturnType<typeof apiClient>);
    post.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    clearAccessTokenGetter();
    clearDugaApiToken();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('starts a backend cookie session with the Auth0 token', async () => {
    sessionStorage.setItem('dugaSessionId', 'existing-session-id');
    setAccessTokenGetter(async () => 'auth0-access-token');

    await startSession();

    expect(mockApiClient).toHaveBeenCalledWith('auth0-access-token');
    expect(post).toHaveBeenCalledWith('/sessions/start', {});
    expect(localStorage.getItem('dugaApiToken')).toBeNull();
  });

  it('does not create a browser session id when none exists', async () => {
    setAccessTokenGetter(async () => 'auth0-access-token');

    await startSession();

    expect(post).toHaveBeenCalledWith('/sessions/start', {});
    expect(localStorage.getItem('dugaSessionId')).toBeNull();
    expect(sessionStorage.getItem('dugaSessionId')).toBeNull();
  });

  it('does not store server-issued session data returned from session start', async () => {
    post.mockResolvedValue({
      data: { token: 'backend-api-token', sessionId: 'server-session-id' },
    });
    setAccessTokenGetter(async () => 'auth0-access-token');

    await startSession();

    expect(sessionStorage.getItem('dugaSessionId')).toBeNull();
    expect(localStorage.getItem('dugaSessionId')).toBeNull();
    expect(localStorage.getItem('dugaApiToken')).toBeNull();
  });
});
