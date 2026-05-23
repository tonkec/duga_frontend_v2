import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import UsersPage from '.';
import { useSocket } from '../../context/useSocket';
import { useEnsureBackendUser } from '../../hooks/useEnsureBackendUser';
import { useGetAllUsers } from '../../hooks/useGetAllUsers';

jest.mock('@app/components/AppLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@app/components/UserAvatar', () => ({
  __esModule: true,
  default: ({ avatarFallbackName }: { avatarFallbackName: string }) => (
    <span aria-label={`${avatarFallbackName} avatar`} />
  ),
}));

jest.mock('@app/context/useSocket', () => ({
  useSocket: jest.fn(),
}));

jest.mock('@app/hooks/useEnsureBackendUser', () => ({
  useEnsureBackendUser: jest.fn(),
}));

jest.mock('@app/hooks/useGetAllUsers', () => ({
  useGetAllUsers: jest.fn(),
}));

jest.mock('@app/hooks/useGetWindowSize', () => ({
  useGetWindowSize: () => ({
    width: 1200,
    height: 800,
  }),
}));

const mockUseSocket = jest.mocked(useSocket);
const mockUseEnsureBackendUser = jest.mocked(useEnsureBackendUser);
const mockUseGetAllUsers = jest.mocked(useGetAllUsers);

const apiUser = ({
  id,
  username,
  isVerified = true,
  status = 'offline',
  updatedAt = '2026-05-23T08:00:00.000Z',
  gender = 'Nebinarna osoba',
  location = 'Zagreb',
  sexuality = 'Queer',
}: {
  id: number;
  username: string;
  isVerified?: boolean;
  status?: 'online' | 'offline';
  updatedAt?: string;
  gender?: string;
  location?: string;
  sexuality?: string;
}) => ({
  id,
  username,
  isVerified,
  status,
  updatedAt,
  avatar: '',
  email: `${username}@example.com`,
  lastName: '',
  firstName: '',
  bio: '',
  gender,
  location,
  password: '',
  sexuality,
  age: 30,
});

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const renderUsersPage = () =>
  render(
    <MemoryRouter initialEntries={['/users']}>
      <LocationProbe />
      <Routes>
        <Route path="/users" element={<UsersPage />} />
        <Route path="/user/:userId" element={<h1>User profile</h1>} />
      </Routes>
    </MemoryRouter>
  );

describe('UsersPage dating flow integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSocket.mockReturnValue({
      on: jest.fn(),
      off: jest.fn(),
    } as unknown as ReturnType<typeof useSocket>);
    mockUseEnsureBackendUser.mockReturnValue({
      data: {
        id: 1,
        username: 'current_user',
      },
      isLoading: false,
    } as ReturnType<typeof useEnsureBackendUser>);
  });

  it('renders user cards from API data', () => {
    mockUseGetAllUsers.mockReturnValue({
      allUsers: {
        data: [
          apiUser({
            id: 1,
            username: 'current_user',
            status: 'online',
          }),
          apiUser({
            id: 2,
            username: 'visible_online_user',
            status: 'online',
          }),
          apiUser({
            id: 3,
            username: 'visible_offline_user',
            status: 'offline',
          }),
          apiUser({
            id: 4,
            username: 'unverified_user',
            isVerified: false,
          }),
        ],
      },
      allUsersError: null,
      isAllUsersLoading: false,
    } as ReturnType<typeof useGetAllUsers>);

    renderUsersPage();

    expect(screen.getByRole('heading', { name: 'visible_online_user' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'visible_offline_user' })).toBeVisible();
    expect(screen.getAllByText('Zagreb')).toHaveLength(2);
    expect(screen.getAllByText('30 godina')).toHaveLength(2);
    expect(screen.getByText('Online')).toBeVisible();
    expect(screen.getByText('Offline')).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'current_user' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'unverified_user' })).not.toBeInTheDocument();
  });

  it('opens a user profile when a rendered card is clicked', () => {
    mockUseGetAllUsers.mockReturnValue({
      allUsers: {
        data: [
          apiUser({
            id: 2,
            username: 'profile_target',
          }),
        ],
      },
      allUsersError: null,
      isAllUsersLoading: false,
    } as ReturnType<typeof useGetAllUsers>);

    renderUsersPage();

    fireEvent.click(screen.getByRole('heading', { name: 'profile_target' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/user/2');
    expect(screen.getByRole('heading', { name: 'User profile' })).toBeVisible();
  });

  it('shows an empty state when API users are not visible', () => {
    mockUseGetAllUsers.mockReturnValue({
      allUsers: {
        data: [
          apiUser({
            id: 1,
            username: 'current_user',
          }),
          apiUser({
            id: 4,
            username: 'unverified_user',
            isVerified: false,
          }),
        ],
      },
      allUsersError: null,
      isAllUsersLoading: false,
    } as ReturnType<typeof useGetAllUsers>);

    renderUsersPage();

    expect(screen.getByRole('heading', { name: 'Nema korisnika 😢' })).toBeVisible();
  });

  it('updates visible users when filter and search change', () => {
    mockUseGetAllUsers.mockReturnValue({
      allUsers: {
        data: [
          apiUser({
            id: 2,
            username: 'alpha_match',
          }),
          apiUser({
            id: 3,
            username: 'beta_match',
          }),
        ],
      },
      allUsersError: null,
      isAllUsersLoading: false,
    } as ReturnType<typeof useGetAllUsers>);

    renderUsersPage();

    expect(screen.getByRole('heading', { name: 'alpha_match' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'beta_match' })).toBeVisible();

    fireEvent.keyDown(screen.getByText('Odaberite kriterij'), {
      key: 'ArrowDown',
      code: 'ArrowDown',
    });
    fireEvent.click(screen.getByText('Ime'));
    fireEvent.change(screen.getByPlaceholderText('Pretraži prema imenu...'), {
      target: {
        value: 'alpha',
      },
    });

    expect(screen.getByRole('heading', { name: 'alpha_match' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'beta_match' })).not.toBeInTheDocument();
  });
});
