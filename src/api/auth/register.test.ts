import { apiClient } from '..';
import { clearAccessTokenGetter, setAccessTokenGetter } from '../authToken';
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
    mockApiClient.mockReturnValue({ post } as unknown as ReturnType<typeof apiClient>);
  });

  afterEach(() => {
    clearAccessTokenGetter();
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
});
