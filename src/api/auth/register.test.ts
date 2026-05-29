import { apiClient } from '..';
import { clearAccessTokenGetter, clearCachedAccessToken, setAccessTokenGetter } from '../authToken';
import { register } from './register';

jest.mock('..', () => ({
  apiClient: jest.fn(),
}));

const mockApiClient = jest.mocked(apiClient);
const post = jest.fn();

describe('register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAccessTokenGetter();
    clearCachedAccessToken();
    mockApiClient.mockReturnValue({ post } as unknown as ReturnType<typeof apiClient>);
  });

  afterEach(() => {
    clearAccessTokenGetter();
    clearCachedAccessToken();
  });

  it('registers with the Auth0 token getter', async () => {
    post.mockResolvedValue({ data: { sessionId: 'registered-session-id' } });
    setAccessTokenGetter(async () => 'auth0-access-token');

    await register('auth0|user', 'user@example.com', 'generated-user', true);

    expect(mockApiClient).toHaveBeenCalledWith('auth0-access-token');
    expect(post).toHaveBeenCalledWith('/register', {
      auth0Id: 'auth0|user',
      email: 'user@example.com',
      isVerified: true,
      username: 'generated-user',
    });
  });

  it('uses an explicit bootstrap token when provided', async () => {
    post.mockResolvedValue({ data: { data: { sessionId: 'nested-session-id' } } });

    await register('auth0|user', 'user@example.com', 'generated-user', true, 'explicit-token');

    expect(mockApiClient).toHaveBeenCalledWith('explicit-token');
  });

  it('rejects when no Auth0 token is available', async () => {
    await expect(
      register('auth0|user', 'user@example.com', 'generated-user', true)
    ).rejects.toMatchObject({
      response: {
        status: 401,
        data: { message: 'Not authenticated: Auth0 token missing' },
      },
    });

    expect(mockApiClient).not.toHaveBeenCalled();
  });
});
