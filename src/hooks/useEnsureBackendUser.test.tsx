import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { apiClient } from '@app/api';
import { useCurrentBackendUser } from './useEnsureBackendUser';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('@app/api', () => ({
  apiClient: jest.fn(),
}));

jest.mock('random-words', () => ({
  generate: jest.fn(() => ['generated']),
}));

const mockUseAuth0 = jest.mocked(useAuth0);
const mockApiClient = jest.mocked(apiClient);
const get = jest.fn();

const renderUseCurrentBackendUser = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return renderHook(() => useCurrentBackendUser(), { wrapper });
};

const renderUseCurrentBackendUserWithoutAuth0Requirement = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return renderHook(() => useCurrentBackendUser({ requireAuth0: false }), { wrapper });
};

const renderUseCurrentBackendUserDisabled = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return renderHook(() => useCurrentBackendUser({ enabled: false }), { wrapper });
};

describe('useCurrentBackendUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    mockApiClient.mockReturnValue({ get } as unknown as ReturnType<typeof apiClient>);
    get.mockResolvedValue({ data: { id: 1, username: 'current-user' } });
  });

  it('fetches the current backend user without registering verified users', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        sub: 'auth0|verified-user',
        email: 'verified@example.com',
        email_verified: true,
      },
    } as unknown as ReturnType<typeof useAuth0>);

    const { result } = renderUseCurrentBackendUser();

    await waitFor(() => expect(result.current.data).toEqual({ id: 1, username: 'current-user' }));
    expect(mockApiClient).toHaveBeenCalledWith();
    expect(get).toHaveBeenCalledWith('/users/current-user', {
      skipGlobalErrorHandler: true,
    });
  });

  it('fetches the current backend user without registering unverified users', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        sub: 'auth0|unverified-user',
        email: 'unverified@example.com',
        email_verified: false,
      },
    } as unknown as ReturnType<typeof useAuth0>);

    const { result } = renderUseCurrentBackendUser();

    await waitFor(() => expect(result.current.data).toEqual({ id: 1, username: 'current-user' }));
    expect(mockApiClient).toHaveBeenCalledWith();
  });

  it('does not register or fetch when disabled', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        sub: 'auth0|disabled-user',
        email: 'disabled@example.com',
        email_verified: true,
      },
    } as unknown as ReturnType<typeof useAuth0>);

    const { result } = renderUseCurrentBackendUserDisabled();

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mockApiClient).not.toHaveBeenCalled();
  });

  it('can fetch using only the backend cookie session when Auth0 is not authenticated', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    } as unknown as ReturnType<typeof useAuth0>);

    const { result } = renderUseCurrentBackendUserWithoutAuth0Requirement();

    await waitFor(() => expect(result.current.data).toEqual({ id: 1, username: 'current-user' }));
    expect(mockApiClient).toHaveBeenCalledWith();
  });

  it('does not register or fetch when the app session is revoked', async () => {
    sessionStorage.setItem('dugaSessionRevoked', 'true');
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        sub: 'auth0|revoked-user',
        email: 'revoked@example.com',
        email_verified: true,
      },
    } as unknown as ReturnType<typeof useAuth0>);

    const { result } = renderUseCurrentBackendUser();

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(mockApiClient).not.toHaveBeenCalled();
  });

  it('does not require Auth0 profile fields beyond authentication state', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        email: 'missing-sub@example.com',
        email_verified: true,
      },
    } as unknown as ReturnType<typeof useAuth0>);

    const { result } = renderUseCurrentBackendUser();

    await waitFor(() => expect(result.current.data).toEqual({ id: 1, username: 'current-user' }));
    expect(mockApiClient).toHaveBeenCalledWith();
  });
});
