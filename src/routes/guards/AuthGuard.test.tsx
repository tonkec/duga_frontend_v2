import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { AuthGuard } from './AuthGuard';
import { AppSessionContext, AppSessionStatus } from '../../context/AppSessionContext';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('@app/configs/auth0Env', () => ({
  getAuth0Audience: () => 'test-audience',
}));

const mockUseAuth0 = jest.mocked(useAuth0);
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
  });

  it('redirects unauthenticated users from protected pages to login', async () => {
    mockUseAuth0.mockReturnValue(auth0State({ isAuthenticated: false }));

    renderProtectedRoute();

    expect(await screen.findByText('Login page')).toBeVisible();
    expect(screen.queryByText('Protected settings')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/login'));
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
    expect(getAccessTokenSilently).toHaveBeenCalled();
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
});
