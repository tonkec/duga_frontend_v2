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
    localStorage.clear();
    sessionStorage.clear();
    clearAccessTokenGetter();
    mockApiClient.mockReturnValue({ post } as unknown as ReturnType<typeof apiClient>);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearAccessTokenGetter();
  });

  it('stores the backend session id returned from register', async () => {
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
    expect(sessionStorage.getItem('dugaSessionId')).toBe('registered-session-id');
    expect(localStorage.getItem('dugaSessionId')).toBeNull();
  });

  it('stores a nested backend session id returned from register', async () => {
    post.mockResolvedValue({ data: { data: { sessionId: 'nested-session-id' } } });

    await register('auth0|user', 'user@example.com', 'generated-user', true, 'explicit-token');

    expect(mockApiClient).toHaveBeenCalledWith('explicit-token');
    expect(sessionStorage.getItem('dugaSessionId')).toBe('nested-session-id');
    expect(localStorage.getItem('dugaSessionId')).toBeNull();
  });
});
