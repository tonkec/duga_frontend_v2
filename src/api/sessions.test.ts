import { apiClient } from '.';
import { clearAccessTokenGetter, setAccessTokenGetter } from './authToken';
import { startSession } from './sessions';

jest.mock('.', () => ({
  apiClient: jest.fn(),
}));

const mockApiClient = jest.mocked(apiClient);
const post = jest.fn();

describe('startSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAccessTokenGetter();
    mockApiClient.mockReturnValue({ post } as unknown as ReturnType<typeof apiClient>);
    post.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    clearAccessTokenGetter();
  });

  it('starts a backend cookie session with the Auth0 token', async () => {
    setAccessTokenGetter(async () => 'auth0-access-token');

    await startSession();

    expect(mockApiClient).toHaveBeenCalledWith('auth0-access-token');
    expect(post).toHaveBeenCalledWith('/sessions/start', {});
  });

  it('posts an empty body and lets the browser store the HttpOnly cookie', async () => {
    setAccessTokenGetter(async () => 'auth0-access-token');

    await startSession();

    expect(post).toHaveBeenCalledWith('/sessions/start', {});
  });

  it('ignores any session credentials returned from session start', async () => {
    post.mockResolvedValue({
      data: { token: 'backend-api-token', sessionId: 'server-session-id' },
    });
    setAccessTokenGetter(async () => 'auth0-access-token');

    await startSession();

    expect(post).toHaveBeenCalledWith('/sessions/start', {});
  });
});
