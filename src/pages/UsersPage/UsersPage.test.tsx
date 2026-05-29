import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UsersPage from '.';
import { getProfilePhoto } from '@app/api/uploads';
import { useSocket } from '../../context/useSocket';
import { useCurrentBackendUser } from '../../hooks/useEnsureBackendUser';
import { useGetAllUsers } from '../../hooks/useGetAllUsers';

jest.mock('@app/components/AppLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@app/api/uploads', () => ({
  getProfilePhoto: jest.fn(),
}));

jest.mock('@app/components/UserAvatar', () => ({
  __esModule: true,
  default: ({
    avatarFallbackName,
    profilePhoto,
  }: {
    avatarFallbackName: string;
    profilePhoto?: { securePhotoUrl?: string };
  }) => (
    <span aria-label={`${avatarFallbackName} avatar`}>
      {profilePhoto?.securePhotoUrl || avatarFallbackName}
    </span>
  ),
}));

jest.mock('@app/context/useSocket', () => ({
  useSocket: jest.fn(),
}));

jest.mock('@app/hooks/useEnsureBackendUser', () => ({
  useCurrentBackendUser: jest.fn(),
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
const mockUseCurrentBackendUser = jest.mocked(useCurrentBackendUser);
const mockUseGetAllUsers = jest.mocked(useGetAllUsers);
const mockGetProfilePhoto = jest.mocked(getProfilePhoto);

const apiUser = ({
  id,
  username,
  publicId = `user-${id}-public-id`,
  isVerified = true,
  status = 'offline',
  updatedAt = '2026-05-23T08:00:00.000Z',
  gender = 'Nebinarna osoba',
  location = 'Zagreb',
  sexuality = 'Queer',
  avatar = '',
}: {
  id: number;
  username: string;
  publicId?: string;
  isVerified?: boolean;
  status?: 'online' | 'offline';
  updatedAt?: string;
  gender?: string;
  location?: string;
  sexuality?: string;
  avatar?: string;
}) => ({
  id,
  publicId,
  username,
  isVerified,
  status,
  updatedAt,
  avatar,
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

const renderUsersPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/users']}>
        <LocationProbe />
        <Routes>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/user/:userId" element={<h1>User profile</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('UsersPage dating flow integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSocket.mockReturnValue({
      on: jest.fn(),
      off: jest.fn(),
    } as unknown as ReturnType<typeof useSocket>);
    mockUseCurrentBackendUser.mockReturnValue({
      data: {
        id: 1,
        username: 'current_user',
      },
      isLoading: false,
    } as ReturnType<typeof useCurrentBackendUser>);
    mockGetProfilePhoto.mockResolvedValue({ data: {} } as Awaited<
      ReturnType<typeof getProfilePhoto>
    >);
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

  it('passes user profile photo fields to user card avatars', () => {
    mockUseGetAllUsers.mockReturnValue({
      allUsers: {
        data: [
          apiUser({
            id: 2,
            username: 'user_with_card_photo',
            avatar: 'development/user/2/profile.png',
          }),
        ],
      },
      allUsersError: null,
      isAllUsersLoading: false,
    } as ReturnType<typeof useGetAllUsers>);

    renderUsersPage();

    expect(screen.getByLabelText('user_with_card_photo avatar')).toHaveTextContent(
      'development/user/2/profile.png'
    );
  });

  it('filters users by profile photo', async () => {
    mockGetProfilePhoto.mockImplementation((userId) =>
      Promise.resolve({
        data:
          userId === '2'
            ? { securePhotoUrl: '/uploads/avatar.jpg' }
            : userId === '3'
              ? { securePhotoUrl: 'http://placekitten.com/200/300' }
              : {},
      } as Awaited<ReturnType<typeof getProfilePhoto>>)
    );
    mockUseGetAllUsers.mockReturnValue({
      allUsers: {
        data: [
          apiUser({
            id: 2,
            username: 'user_with_photo',
          }),
          apiUser({
            id: 3,
            username: 'user_with_placeholder_avatar',
          }),
        ],
      },
      allUsersError: null,
      isAllUsersLoading: false,
    } as ReturnType<typeof useGetAllUsers>);

    renderUsersPage();

    fireEvent.click(screen.getByLabelText('Prikaži samo korisnike s profilnom'));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'user_with_photo' })).toBeVisible()
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'user_with_placeholder_avatar' })
      ).not.toBeInTheDocument()
    );
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

    expect(screen.getByTestId('location')).toHaveTextContent('/user/user-2-public-id');
    expect(screen.getByRole('heading', { name: 'User profile' })).toBeVisible();
  });

  it('opens a user profile when Pogledaj profil is clicked', () => {
    mockUseGetAllUsers.mockReturnValue({
      allUsers: {
        data: [
          apiUser({
            id: 5,
            username: 'button_profile_target',
          }),
        ],
      },
      allUsersError: null,
      isAllUsersLoading: false,
    } as ReturnType<typeof useGetAllUsers>);

    renderUsersPage();

    fireEvent.click(screen.getByRole('button', { name: 'Pogledaj profil' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/user/user-5-public-id');
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

    expect(screen.getByRole('heading', { name: 'Nema dostupnih korisnika' })).toBeVisible();
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

    fireEvent.click(screen.getByRole('button', { name: 'Ime' }));
    fireEvent.change(screen.getByPlaceholderText('Pretraži prema imenu...'), {
      target: {
        value: 'alpha',
      },
    });

    expect(screen.getByRole('heading', { name: 'alpha_match' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'beta_match' })).not.toBeInTheDocument();
  });
});
