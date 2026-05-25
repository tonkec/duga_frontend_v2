import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import VerifyEmailPage from '.';
import { useEnsureBackendUser } from '@app/hooks/useEnsureBackendUser';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('@app/hooks/useEnsureBackendUser', () => ({
  useEnsureBackendUser: jest.fn(),
}));

jest.mock('@app/api', () => ({
  apiClient: jest.fn(() => ({
    post: jest.fn(),
  })),
}));

const mockUseAuth0 = jest.mocked(useAuth0);
const mockUseEnsureBackendUser = jest.mocked(useEnsureBackendUser);

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const renderVerifyEmailPage = () =>
  render(
    <MemoryRouter initialEntries={['/verify-email']}>
      <LocationProbe />
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/" element={<h1>Home page</h1>} />
        <Route path="/login" element={<h1>Login page</h1>} />
      </Routes>
    </MemoryRouter>
  );

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEnsureBackendUser.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useEnsureBackendUser>);
  });

  it('leaves the verify email screen when the backend user is verified', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        email: 'verified@example.com',
        email_verified: false,
      },
    } as unknown as ReturnType<typeof useAuth0>);
    mockUseEnsureBackendUser.mockReturnValue({
      data: {
        id: 501,
        isVerified: true,
      },
      isLoading: false,
    } as ReturnType<typeof useEnsureBackendUser>);

    renderVerifyEmailPage();

    expect(await screen.findByText('Home page')).toBeVisible();
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/'));
  });

  it('keeps unverified users on the verify email screen', async () => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        email: 'unverified@example.com',
        email_verified: false,
      },
    } as unknown as ReturnType<typeof useAuth0>);
    mockUseEnsureBackendUser.mockReturnValue({
      data: {
        id: 502,
        isVerified: false,
      },
      isLoading: false,
    } as ReturnType<typeof useEnsureBackendUser>);

    renderVerifyEmailPage();

    expect(
      await screen.findByRole('heading', { name: 'Potvrdi svoju e-mail adresu' })
    ).toBeVisible();
    expect(screen.getByTestId('location')).toHaveTextContent('/verify-email');
  });
});
