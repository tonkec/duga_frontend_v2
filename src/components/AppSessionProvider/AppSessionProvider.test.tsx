import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import AppSessionProvider from '.';
import { register } from '../../api/auth/register';
import { startSession } from '../../api/sessions';
import { getCurrentUser } from '../../api/users';
import { useAppSessionStatus } from '../../context/AppSessionContext';
import { generateUniqueUsername } from '../../hooks/useEnsureBackendUser';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    info: jest.fn(),
  },
}));

jest.mock('@app/api/auth/register', () => ({
  register: jest.fn(),
}));

jest.mock('@app/api/sessions', () => ({
  startSession: jest.fn(),
}));

jest.mock('@app/api/users', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@app/hooks/useEnsureBackendUser', () => ({
  generateUniqueUsername: jest.fn(),
}));

const mockUseAuth0 = jest.mocked(useAuth0);
const mockRegister = jest.mocked(register);
const mockStartSession = jest.mocked(startSession);
const mockGetCurrentUser = jest.mocked(getCurrentUser);
const mockGenerateUniqueUsername = jest.mocked(generateUniqueUsername);
const mockToastInfo = jest.mocked(toast.info);
const logout = jest.fn();

const SESSION_REVOKED_KEY = 'dugaSessionRevoked';
const CYPRESS_SKIP_SESSION_START_KEY = 'duga:cypress-skip-session-start';

type CypressWindow = Window &
  typeof globalThis & {
    Cypress?: unknown;
  };

const auth0State = (overrides: Record<string, unknown>) =>
  ({
    isAuthenticated: false,
    isLoading: false,
    logout,
    user: undefined,
    ...overrides,
  }) as unknown as ReturnType<typeof useAuth0>;

const StatusProbe = () => {
  const status = useAppSessionStatus();
  return <div data-testid="session-status">{status}</div>;
};

const renderAppSessionProvider = ({ strictMode = false }: { strictMode?: boolean } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const tree = (
    <QueryClientProvider client={queryClient}>
      <AppSessionProvider>
        <StatusProbe />
      </AppSessionProvider>
    </QueryClientProvider>
  );

  return render(strictMode ? <React.StrictMode>{tree}</React.StrictMode> : tree);
};

describe('AppSessionProvider login/session start integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    delete (window as CypressWindow).Cypress;
    mockRegister.mockResolvedValue({} as Awaited<ReturnType<typeof register>>);
    mockStartSession.mockResolvedValue({} as Awaited<ReturnType<typeof startSession>>);
    mockGetCurrentUser.mockRejectedValue({
      response: {
        status: 401,
      },
    });
    mockGenerateUniqueUsername.mockReturnValue('generated-user');
  });

  afterEach(() => {
    delete (window as CypressWindow).Cypress;
    localStorage.clear();
    sessionStorage.clear();
  });

  it('does not register or start a session before Auth0 login', async () => {
    mockUseAuth0.mockReturnValue(auth0State({ isAuthenticated: false }));

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('active');
    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockStartSession).not.toHaveBeenCalled();
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
  });

  it('registers the backend user before starting an app session after Auth0 login', async () => {
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

    await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1));
    expect(mockRegister).toHaveBeenCalledWith(
      'auth0|login-session-user',
      'login-session@example.com',
      'generated-user',
      true
    );
    expect(mockRegister.mock.invocationCallOrder[0]).toBeLessThan(
      mockStartSession.mock.invocationCallOrder[0]
    );
    expect(mockStartSession).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId('session-status')).toHaveTextContent('active');
  });

  it('reuses an existing cookie-backed app session on refresh', async () => {
    sessionStorage.setItem('dugaCsrfToken', 'stored-csrf-token');
    mockGetCurrentUser.mockResolvedValue({
      data: {
        id: 1,
        username: 'existing-user',
        isVerified: true,
      },
    } as Awaited<ReturnType<typeof getCurrentUser>>);
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          sub: 'auth0|existing-session-user',
          email: 'existing-session@example.com',
          email_verified: true,
        },
      })
    );

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('active');
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it('refreshes an existing cookie-backed app session when no csrf token is stored', async () => {
    mockGetCurrentUser.mockResolvedValue({
      data: {
        id: 1,
        username: 'existing-user',
        isVerified: true,
      },
    } as Awaited<ReturnType<typeof getCurrentUser>>);
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          sub: 'auth0|existing-session-missing-csrf-user',
          email: 'existing-session@example.com',
          email_verified: true,
        },
      })
    );

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('active');
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockStartSession).toHaveBeenCalledTimes(1);
  });

  it('registers and starts an app session for unverified Auth0 users', async () => {
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          sub: 'auth0|unverified-user',
          email: 'unverified@example.com',
          email_verified: false,
        },
      })
    );

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('active');
    expect(mockRegister).toHaveBeenCalledWith(
      'auth0|unverified-user',
      'unverified@example.com',
      'generated-user',
      false
    );
    expect(mockStartSession).toHaveBeenCalledTimes(1);
  });

  it('starts only one backend app session when React StrictMode replays effects', async () => {
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          sub: 'auth0|strict-mode-user',
          email: 'strict-mode@example.com',
          email_verified: true,
        },
      })
    );

    renderAppSessionProvider({ strictMode: true });

    expect(await screen.findByTestId('session-status')).toHaveTextContent('active');
    expect(mockStartSession).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledTimes(1);
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
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
  });

  it('reports an auth setup error when Auth0 identity is incomplete', async () => {
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          sub: 'auth0|missing-email-user',
          email_verified: true,
        },
      })
    );

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('error');
    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockStartSession).not.toHaveBeenCalled();
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
  });

  it('skips backend auth startup only for Cypress when explicitly requested', async () => {
    (window as CypressWindow).Cypress = {};
    localStorage.setItem(CYPRESS_SKIP_SESSION_START_KEY, 'true');
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          sub: 'auth0|cypress-user',
          email: 'cypress@example.com',
          email_verified: true,
        },
      })
    );

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('active');
    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockStartSession).not.toHaveBeenCalled();
    expect(mockGetCurrentUser).not.toHaveBeenCalled();
  });

  it('logs out the Auth0 session when the app session is revoked', async () => {
    mockUseAuth0.mockReturnValue(auth0State({ isAuthenticated: false }));

    renderAppSessionProvider();

    window.dispatchEvent(new Event('duga:session-revoked'));

    await waitFor(() =>
      expect(logout).toHaveBeenCalledWith({
        logoutParams: {
          returnTo: 'http://localhost',
        },
      })
    );
    expect(mockToastInfo).toHaveBeenCalledWith(
      'Odjavljeni ste jer je račun otvoren u drugoj sesiji.',
      expect.any(Object)
    );
  });

  it('shows a one-time toast after returning from a revoked app session logout', async () => {
    sessionStorage.setItem('dugaSessionRevokedNotice', 'true');
    mockUseAuth0.mockReturnValue(auth0State({ isAuthenticated: false }));

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('active');
    expect(mockToastInfo).toHaveBeenCalledWith(
      'Odjavljeni ste jer je račun otvoren u drugoj sesiji.',
      expect.any(Object)
    );
    expect(sessionStorage.getItem('dugaSessionRevokedNotice')).toBeNull();
  });

  it('marks the app session revoked when backend session startup conflicts', async () => {
    mockStartSession.mockRejectedValue({
      config: {
        url: '/sessions/start',
      },
      response: {
        status: 409,
        data: {},
      },
    });
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          sub: 'auth0|conflicting-user',
          email: 'conflicting@example.com',
          email_verified: true,
        },
      })
    );

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('revoked');
    expect(sessionStorage.getItem(SESSION_REVOKED_KEY)).toBe('true');
  });

  it('reports an error when backend session startup fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockStartSession.mockRejectedValue(new Error('session failed'));
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
    expect(mockRegister).toHaveBeenCalledWith(
      'auth0|failing-user',
      'failing@example.com',
      'generated-user',
      true
    );
    consoleErrorSpy.mockRestore();
  });

  it('reports an error when backend registration fails and does not start a session', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockRegister.mockRejectedValue(new Error('register failed'));
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          sub: 'auth0|register-failing-user',
          email: 'register-failing@example.com',
          email_verified: true,
        },
      })
    );

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('error');
    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockStartSession).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('reports an error when the existing session check fails unexpectedly', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('current user failed'));
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          sub: 'auth0|current-user-failing-user',
          email: 'current-user-failing@example.com',
          email_verified: true,
        },
      })
    );

    renderAppSessionProvider();

    expect(await screen.findByTestId('session-status')).toHaveTextContent('error');
    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockStartSession).not.toHaveBeenCalled();
  });
});
