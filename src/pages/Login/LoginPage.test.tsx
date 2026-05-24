import React from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import LoginPage from '.';
import AppSessionProvider from '../../components/AppSessionProvider';
import {
  AppSessionContext,
  AppSessionStatus,
  useAppSessionStatus,
} from '../../context/AppSessionContext';
import { SESSION_REVOKED_EVENT } from '../../api/appSession';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    info: jest.fn(),
  },
}));

jest.mock('@app/components/FadeIn', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@app/api/auth/register', () => ({
  register: jest.fn().mockResolvedValue({}),
}));

jest.mock('@app/api/sessions', () => ({
  startSession: jest.fn().mockResolvedValue({}),
}));

jest.mock('@app/hooks/useEnsureBackendUser', () => ({
  generateUniqueUsername: jest.fn(() => 'expired-session-user'),
}));

const mockUseAuth0 = jest.mocked(useAuth0);
const mockToastInfo = jest.mocked(toast.info);
const loginWithRedirect = jest.fn();
const logout = jest.fn();

const SESSION_REVOKED_KEY = 'dugaSessionRevoked';

const ProtectedRoute = () => {
  const sessionStatus = useAppSessionStatus();

  if (sessionStatus === 'revoked') {
    return <Navigate to="/login" />;
  }

  return <h1>Protected page</h1>;
};

const renderLoginPage = (sessionStatus: AppSessionStatus = 'active') => {
  document.cookie = 'cookieAccepted=true;path=/';

  render(
    <MemoryRouter>
      <AppSessionContext.Provider value={sessionStatus}>
        <LoginPage />
      </AppSessionContext.Provider>
    </MemoryRouter>
  );
};

describe('LoginPage redirects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockUseAuth0.mockReturnValue({
      loginWithRedirect,
      logout,
    } as unknown as ReturnType<typeof useAuth0>);
  });

  it('redirects to Auth0 with the local app callback URL', () => {
    renderLoginPage();

    fireEvent.click(screen.getAllByRole('button', { name: 'Prijavi se' })[0]);

    expect(loginWithRedirect).toHaveBeenCalledWith({
      appState: {
        returnTo: '/post-login',
      },
      authorizationParams: {
        redirect_uri: 'http://localhost:5173',
      },
    });
  });

  it('clears a session conflict before starting login redirect', () => {
    sessionStorage.setItem(SESSION_REVOKED_KEY, 'true');
    renderLoginPage('revoked');

    expect(
      screen.queryByText('Odjavljeni ste jer je račun otvoren u drugoj sesiji.')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Prijavi se' })[0]);

    expect(sessionStorage.getItem(SESSION_REVOKED_KEY)).toBeNull();
    expect(loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  it('redirects to login and shows a toast when the app session expires', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      loginWithRedirect,
      logout,
    } as unknown as ReturnType<typeof useAuth0>);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/protected']}>
          <AppSessionProvider>
            <Routes>
              <Route path="/protected" element={<ProtectedRoute />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </AppSessionProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText('Protected page')).toBeVisible();

    act(() => {
      window.dispatchEvent(new Event(SESSION_REVOKED_EVENT));
    });

    await waitFor(() =>
      expect(mockToastInfo).toHaveBeenCalledWith(
        'Odjavljeni ste jer je račun otvoren u drugoj sesiji.',
        expect.any(Object)
      )
    );
    await waitFor(() => expect(screen.queryByText('Protected page')).not.toBeInTheDocument());
  });
});
