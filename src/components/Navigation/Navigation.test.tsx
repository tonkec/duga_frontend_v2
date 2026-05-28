import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Navigation from '.';
import { useAuth0 } from '@auth0/auth0-react';
import { useWindowSize } from '@uidotdev/usehooks';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { useSocket } from '@app/context/useSocket';
import { useGetAllNotifcations } from './hooks';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('@uidotdev/usehooks', () => ({
  useWindowSize: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@app/hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('@app/context/useSocket', () => ({
  useSocket: jest.fn(),
}));

jest.mock('./hooks', () => ({
  useGetAllNotifcations: jest.fn(),
}));

jest.mock('../NavigationLinks', () => ({
  NavigationItems: () => <div>Navigation items</div>,
}));

jest.mock('./components/Notifications', () => ({
  __esModule: true,
  default: () => <div>Notification dropdown</div>,
}));

jest.mock('@app/components/UserAvatar', () => ({
  __esModule: true,
  default: () => <div>Avatar</div>,
}));

const mockUseAuth0 = jest.mocked(useAuth0);
const mockUseWindowSize = jest.mocked(useWindowSize);
const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);
const mockUseSocket = jest.mocked(useSocket);
const mockUseGetAllNotifications = jest.mocked(useGetAllNotifcations);

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.title = 'Duga | Poruke';

    mockUseAuth0.mockReturnValue({
      logout: jest.fn(),
    } as unknown as ReturnType<typeof useAuth0>);
    mockUseWindowSize.mockReturnValue({ width: 390, height: 844 });
    mockUseGetCurrentUser.mockReturnValue({
      user: {
        data: {
          id: 7,
        },
      },
      userError: null,
      isUserLoading: false,
    } as ReturnType<typeof useGetCurrentUser>);
    mockUseSocket.mockReturnValue({
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    } as unknown as ReturnType<typeof useSocket>);
  });

  it('shows a red dot in the mobile header when notifications are unread', () => {
    mockUseGetAllNotifications.mockReturnValue({
      allNotifications: {
        data: [{ id: 1, isRead: false }],
      },
      allNotificationsError: null,
      areAllNotificationsLoading: false,
    } as ReturnType<typeof useGetAllNotifcations>);

    render(<Navigation />);

    expect(screen.getByRole('button', { name: 'Otvori navigaciju' })).toBeVisible();
    expect(screen.getByRole('status', { name: 'Nove obavijesti' })).toBeVisible();
  });

  it('prefixes the page title with the unread notification count', async () => {
    mockUseGetAllNotifications.mockReturnValue({
      allNotifications: {
        data: [
          { id: 1, isRead: false },
          { id: 2, isRead: false },
          { id: 3, isRead: true },
        ],
      },
      allNotificationsError: null,
      areAllNotificationsLoading: false,
    } as ReturnType<typeof useGetAllNotifcations>);

    render(<Navigation />);

    await waitFor(() => expect(document.title).toBe('(2) Duga | Poruke'));
  });

  it('does not show the mobile red dot when all notifications are read', () => {
    mockUseGetAllNotifications.mockReturnValue({
      allNotifications: {
        data: [{ id: 1, isRead: true }],
      },
      allNotificationsError: null,
      areAllNotificationsLoading: false,
    } as ReturnType<typeof useGetAllNotifcations>);

    render(<Navigation />);

    expect(screen.queryByRole('status', { name: 'Nove obavijesti' })).not.toBeInTheDocument();
    expect(document.title).toBe('Duga | Poruke');
  });

  it('keeps navigation available while the current user is loading', () => {
    mockUseGetCurrentUser.mockReturnValue({
      user: undefined,
      userError: null,
      isUserLoading: true,
    } as ReturnType<typeof useGetCurrentUser>);
    mockUseGetAllNotifications.mockReturnValue({
      allNotifications: undefined,
      allNotificationsError: null,
      areAllNotificationsLoading: true,
    } as ReturnType<typeof useGetAllNotifcations>);

    render(<Navigation />);

    expect(screen.getByRole('button', { name: 'Otvori navigaciju' })).toBeVisible();
  });
});
