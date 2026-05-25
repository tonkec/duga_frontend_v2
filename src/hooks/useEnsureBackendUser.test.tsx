import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { apiClient } from '@app/api';
import { register } from '@app/api/auth/register';
import { resolveAuth0AccessToken } from '@app/api/authToken';
import { useEnsureBackendUser } from './useEnsureBackendUser';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('@app/api', () => ({
  apiClient: jest.fn(),
}));

jest.mock('@app/api/auth/register', () => ({
  register: jest.fn(),
}));

jest.mock('@app/api/authToken', () => ({
  resolveAuth0AccessToken: jest.fn(),
}));

jest.mock('random-words', () => ({
  generate: jest.fn(() => ['generated']),
}));

const mockUseAuth0 = jest.mocked(useAuth0);
const mockApiClient = jest.mocked(apiClient);
const mockRegister = jest.mocked(register);
const mockResolveAuth0AccessToken = jest.mocked(resolveAuth0AccessToken);
const get = jest.fn();

const renderUseEnsureBackendUser = () => {
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

  return renderHook(() => useEnsureBackendUser(), { wrapper });
};

describe('useEnsureBackendUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    mockResolveAuth0AccessToken.mockResolvedValue('auth0-access-token');
    mockRegister.mockResolvedValue({} as Awaited<ReturnType<typeof register>>);
    mockApiClient.mockReturnValue({ get } as unknown as ReturnType<typeof apiClient>);
    get.mockResolvedValue({ data: { id: 1, username: 'current-user' } });
  });

  it('uses the fresh Auth0 token for verified users after registration', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        sub: 'auth0|verified-user',
        email: 'verified@example.com',
        email_verified: true,
      },
    } as unknown as ReturnType<typeof useAuth0>);

    const { result } = renderUseEnsureBackendUser();

    await waitFor(() => expect(result.current.data).toEqual({ id: 1, username: 'current-user' }));
    expect(mockRegister).toHaveBeenCalledWith(
      'auth0|verified-user',
      'verified@example.com',
      expect.any(String),
      true,
      'auth0-access-token'
    );
    expect(mockApiClient).toHaveBeenCalledWith('auth0-access-token');
    expect(get).toHaveBeenCalledWith('/users/current-user', {
      skipGlobalErrorHandler: true,
    });
  });

  it('keeps using the Auth0 token for unverified users without a backend session token', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        sub: 'auth0|unverified-user',
        email: 'unverified@example.com',
        email_verified: false,
      },
    } as unknown as ReturnType<typeof useAuth0>);

    const { result } = renderUseEnsureBackendUser();

    await waitFor(() => expect(result.current.data).toEqual({ id: 1, username: 'current-user' }));
    expect(mockRegister).toHaveBeenCalledWith(
      'auth0|unverified-user',
      'unverified@example.com',
      expect.any(String),
      false,
      'auth0-access-token'
    );
    expect(mockApiClient).toHaveBeenCalledWith('auth0-access-token');
  });
});
