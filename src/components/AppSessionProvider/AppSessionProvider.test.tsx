import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppSessionProvider from '.';
import { register } from '../../api/auth/register';
import { startSession } from '../../api/sessions';
import { useAppSessionStatus } from '../../context/AppSessionContext';
import { generateUniqueUsername } from '../../hooks/useEnsureBackendUser';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('@app/api/auth/register', () => ({
  register: jest.fn(),
}));

jest.mock('@app/api/sessions', () => ({
  startSession: jest.fn(),
}));

jest.mock('@app/hooks/useEnsureBackendUser', () => ({
  generateUniqueUsername: jest.fn(),
}));

const mockUseAuth0 = jest.mocked(useAuth0);
const mockRegister = jest.mocked(register);
const mockStartSession = jest.mocked(startSession);
const mockGenerateUniqueUsername = jest.mocked(generateUniqueUsername);

const SESSION_REVOKED_KEY = 'dugaSessionRevoked';

const auth0State = (overrides: Record<string, unknown>) =>
  ({
    isAuthenticated: false,
    isLoading: false,
    user: undefined,
    ...overrides,
  }) as unknown as ReturnType<typeof useAuth0>;

const StatusProbe = () => {
  const status = useAppSessionStatus();
  return <div data-testid="session-status">{status}</div>;
};

const renderAppSessionProvider = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AppSessionProvider>
        <StatusProbe />
      </AppSessionProvider>
    </QueryClientProvider>
  );
};

describe('AppSessionProvider login/session start integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    mockRegister.mockResolvedValue({} as Awaited<ReturnType<typeof register>>);
    mockStartSession.mockResolvedValue({} as Awaited<ReturnType<typeof startSession>>);
    mockGenerateUniqueUsername.mockReturnValue('generated-user');
  });

  it('does not register or start a session before Auth0 login', async () => {
    mockUseAuth0.mockReturnValue(auth0State({ isAuthenticated: false }));

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('active');
    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it('registers the backend user and starts an app session after Auth0 login', async () => {
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          sub: 'auth0|login-session-user',
          email: 'login-session@example.com',
          email_verified: true,
        },
      })
    );

    renderAppSessionProvider();

    await waitFor(() => expect(mockStartSession).toHaveBeenCalledTimes(1));
    expect(mockRegister).toHaveBeenCalledWith(
      'auth0|login-session-user',
      'login-session@example.com',
      'generated-user',
      true
    );
    expect(await screen.findByTestId('session-status')).toHaveTextContent('active');
  });

  it('does not start a new session when the stored app session is revoked', async () => {
    sessionStorage.setItem(SESSION_REVOKED_KEY, 'true');
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          sub: 'auth0|revoked-user',
          email: 'revoked@example.com',
          email_verified: true,
        },
      })
    );

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('revoked');
    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it('reports an error when backend session startup fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockRegister.mockRejectedValue(new Error('register failed'));
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          sub: 'auth0|failing-user',
          email: 'failing@example.com',
          email_verified: true,
        },
      })
    );

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('error');
    expect(mockStartSession).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
