import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { AuthGuard } from './AuthGuard';
import { AppSessionContext, AppSessionStatus } from '../../context/AppSessionContext';
import { useCurrentBackendUser } from '../../hooks/useEnsureBackendUser';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('@app/hooks/useEnsureBackendUser', () => ({
  useCurrentBackendUser: jest.fn(),
}));

const mockUseAuth0 = jest.mocked(useAuth0);
const mockUseCurrentBackendUser = jest.mocked(useCurrentBackendUser);
const getAccessTokenSilently = jest.fn();

const auth0State = (overrides: Record<string, unknown>) =>
  ({
    isAuthenticated: false,
    isLoading: false,
    user: undefined,
    getAccessTokenSilently,
    ...overrides,
  }) as unknown as ReturnType<typeof useAuth0>;

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const renderProtectedRoute = (sessionStatus: AppSessionStatus = 'active') =>
  render(
    <AppSessionContext.Provider value={sessionStatus}>
      <MemoryRouter initialEntries={['/settings']}>
        <LocationProbe />
        <Routes>
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <h1>Protected settings</h1>
              </AuthGuard>
            }
          />
          <Route path="/login" element={<h1>Login page</h1>} />
          <Route path="/verify-email" element={<h1>Verify email</h1>} />
        </Routes>
      </MemoryRouter>
    </AppSessionContext.Provider>
  );

describe('AuthGuard protected route redirects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAccessTokenSilently.mockResolvedValue('test-token');
    mockUseCurrentBackendUser.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentBackendUser>);
  });

  it('redirects unauthenticated users from protected pages to login', async () => {
    mockUseAuth0.mockReturnValue(auth0State({ isAuthenticated: false }));

    renderProtectedRoute();

    expect(await screen.findByText('Login page')).toBeVisible();
    expect(screen.queryByText('Protected settings')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/login'));
  });

  it('allows a valid backend cookie session after Auth0 memory state is lost on refresh', async () => {
    mockUseAuth0.mockReturnValue(auth0State({ isAuthenticated: false }));
    mockUseCurrentBackendUser.mockReturnValue({
      data: {
        id: 1,
        username: 'cookie-session-user',
        isVerified: true,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentBackendUser>);

    renderProtectedRoute();

    expect(await screen.findByText('Protected settings')).toBeVisible();
    expect(screen.getByTestId('location')).toHaveTextContent('/settings');
    expect(mockUseCurrentBackendUser).toHaveBeenCalledWith({
      enabled: true,
      requireAuth0: false,
    });
  });

  it('allows authenticated verified users with an active app session', async () => {
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          email_verified: true,
        },
      })
    );

    renderProtectedRoute();

    expect(await screen.findByText('Protected settings')).toBeVisible();
    expect(screen.getByTestId('location')).toHaveTextContent('/settings');
  });

  it('redirects authenticated unverified users to verify email', async () => {
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          email_verified: false,
        },
      })
    );

    renderProtectedRoute();

    expect(await screen.findByText('Verify email')).toBeVisible();
    expect(screen.queryByText('Protected settings')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/verify-email'));
  });

  it('allows users verified by the backend when Auth0 email verification is stale', async () => {
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          email_verified: false,
        },
      })
    );
    mockUseCurrentBackendUser.mockReturnValue({
      data: {
        isVerified: true,
      },
      isLoading: false,
    } as ReturnType<typeof useCurrentBackendUser>);

    renderProtectedRoute();

    expect(await screen.findByText('Protected settings')).toBeVisible();
    expect(screen.getByTestId('location')).toHaveTextContent('/settings');
  });

  it('redirects to login instead of verify email when the backend session is revoked', async () => {
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          email_verified: false,
        },
      })
    );
    mockUseCurrentBackendUser.mockReturnValue({
      data: undefined,
      error: {
        response: {
          status: 401,
          data: { code: 'SESSION_REVOKED' },
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useCurrentBackendUser>);

    renderProtectedRoute();

    expect(await screen.findByText('Login page')).toBeVisible();
    expect(screen.queryByText('Verify email')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/login'));
  });

  it('redirects authenticated users to login when the app session is not active', async () => {
    mockUseAuth0.mockReturnValue(
      auth0State({
        isAuthenticated: true,
        user: {
          email_verified: true,
        },
      })
    );

    renderProtectedRoute('revoked');

    expect(await screen.findByText('Login page')).toBeVisible();
    expect(screen.queryByText('Protected settings')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/login'));
  });

  it('waits while checking the backend cookie session', async () => {
    mockUseAuth0.mockReturnValue(auth0State({ isAuthenticated: false }));
    mockUseCurrentBackendUser.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useCurrentBackendUser>);

    renderProtectedRoute();

    expect(await screen.findByText('Učitavanje...')).toBeVisible();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });
});
