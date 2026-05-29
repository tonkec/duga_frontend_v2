import { render, screen, waitFor } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import AuthTokenBridge from '.';
import { clearAccessTokenGetter, resolveAuth0AccessToken } from '@app/api/authToken';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

const mockUseAuth0 = jest.mocked(useAuth0);

describe('AuthTokenBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAccessTokenGetter();
  });

  afterEach(() => {
    clearAccessTokenGetter();
  });

  it('registers the Auth0 access token getter before rendering authenticated children', async () => {
    const getAccessTokenSilently = jest.fn().mockResolvedValue('auth0-access-token');

    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      getAccessTokenSilently,
    } as unknown as ReturnType<typeof useAuth0>);

    render(
      <AuthTokenBridge>
        <span>children-ready</span>
      </AuthTokenBridge>
    );

    await waitFor(() => expect(screen.getByText('children-ready')).toBeVisible());
    await expect(resolveAuth0AccessToken()).resolves.toBe('auth0-access-token');
  });

  it('registers the silent token getter after refresh even when Auth0 is not authenticated yet', async () => {
    const getAccessTokenSilently = jest.fn().mockResolvedValue('silent-refresh-token');

    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      getAccessTokenSilently,
    } as unknown as ReturnType<typeof useAuth0>);

    render(
      <AuthTokenBridge>
        <span>public-children</span>
      </AuthTokenBridge>
    );

    expect(screen.getByText('public-children')).toBeVisible();
    await expect(resolveAuth0AccessToken()).resolves.toBe('silent-refresh-token');
  });

  it('waits for Auth0 loading before rendering children', () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      getAccessTokenSilently: jest.fn(),
    } as unknown as ReturnType<typeof useAuth0>);

    render(
      <AuthTokenBridge>
        <span>loading-children</span>
      </AuthTokenBridge>
    );

    expect(screen.queryByText('loading-children')).not.toBeInTheDocument();
  });
});
