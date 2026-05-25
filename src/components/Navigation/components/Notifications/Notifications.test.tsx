import React from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import NotificationDropdown, { INotification } from '.';
import { useSocket } from '@app/context/useSocket';
import {
  useGetAllNotifcations,
  useMarkAllAsReadNotifications,
  useMarkAsReadNotification,
} from '@app/components/Navigation/hooks';

const navigate = jest.fn();

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => navigate,
}));

jest.mock('@app/context/useSocket', () => ({
  useSocket: jest.fn(),
}));

jest.mock('@app/components/Navigation/hooks', () => ({
  useGetAllNotifcations: jest.fn(),
  useMarkAllAsReadNotifications: jest.fn(),
  useMarkAsReadNotification: jest.fn(),
}));

const mockUseSocket = jest.mocked(useSocket);
const mockUseGetAllNotifications = jest.mocked(useGetAllNotifcations);
const mockUseMarkAllAsReadNotifications = jest.mocked(useMarkAllAsReadNotifications);
const mockUseMarkAsReadNotification = jest.mocked(useMarkAsReadNotification);

const mutateMarkAllAsRead = jest.fn();
const mutateMarkAsRead = jest.fn();
const socketOn = jest.fn();
const socketOff = jest.fn();
const socketHandlers: Record<string, (payload: INotification) => void> = {};

const notification = (overrides: Partial<INotification> = {}): INotification => ({
  id: 1,
  userId: 7,
  type: 'info',
  content: 'Nova obavijest',
  isRead: false,
  createdAt: '2026-05-25T10:00:00.000Z',
  updatedAt: '2026-05-25T10:00:00.000Z',
  chatId: null,
  actionId: 42,
  actionType: 'forum_question',
  ...overrides,
});

const renderNotifications = (isMobile = false) =>
  render(<NotificationDropdown userId={7} isMobile={isMobile} />);

describe('NotificationDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(socketHandlers).forEach((event) => delete socketHandlers[event]);

    mockUseSocket.mockReturnValue({
      on: socketOn.mockImplementation((event, handler) => {
        socketHandlers[event] = handler;
      }),
      off: socketOff,
      emit: jest.fn(),
    } as unknown as ReturnType<typeof useSocket>);

    mockUseGetAllNotifications.mockReturnValue({
      allNotifications: {
        data: [
          notification({ id: 1, content: 'Novo pitanje na forumu', isRead: false }),
          notification({ id: 2, content: 'Stara poruka', isRead: true, actionType: 'message' }),
        ],
      },
      allNotificationsError: null,
      areAllNotificationsLoading: false,
    } as ReturnType<typeof useGetAllNotifcations>);

    mockUseMarkAllAsReadNotifications.mockReturnValue({
      mutateMarkAllAsRead,
      isMarkingAllAsRead: false,
      isMarkAllAsReadError: false,
      isMarkAllAsReadSuccess: false,
    } as ReturnType<typeof useMarkAllAsReadNotifications>);

    mockUseMarkAsReadNotification.mockReturnValue({
      mutateMarkAsRead,
      isMarkingAsRead: false,
      isMarkAsReadError: false,
      isMarkAsReadSuccess: false,
    } as ReturnType<typeof useMarkAsReadNotification>);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders fetched notifications and marks all as read locally', async () => {
    renderNotifications();

    fireEvent.click(screen.getByRole('button', { name: /obavijesti/i }));

    expect(await screen.findByText('Novo pitanje na forumu')).toBeVisible();
    expect(screen.getByText('Stara poruka')).toBeVisible();
    expect(screen.getByText('2')).toBeVisible();
    expect(screen.getByText('Novo')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /označi sve kao pročitano/i }));

    expect(mutateMarkAllAsRead).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Novo')).not.toBeInTheDocument();
    expect(screen.getAllByText('Pročitano')).toHaveLength(2);
  });

  it('adds new notifications from socket events without refreshing data', async () => {
    renderNotifications();

    fireEvent.click(screen.getByRole('button', { name: /obavijesti/i }));
    expect(await screen.findByText('Novo pitanje na forumu')).toBeVisible();

    act(() => {
      socketHandlers.new_notification(
        notification({ id: 3, content: 'Novi komentar na slici', actionType: 'comment' })
      );
    });

    expect(screen.getByText('Novi komentar na slici')).toBeVisible();
    expect(screen.getByText('3')).toBeVisible();
  });

  it('updates a notification as read from socket events', async () => {
    renderNotifications();

    fireEvent.click(screen.getByRole('button', { name: /obavijesti/i }));
    expect(await screen.findByText('Novo pitanje na forumu')).toBeVisible();

    act(() => {
      socketHandlers.markAsRead(notification({ id: 1, isRead: true }));
    });

    const updatedNotification = screen.getByText('Novo pitanje na forumu').closest('button');
    expect(updatedNotification).not.toBeNull();
    expect(within(updatedNotification as HTMLElement).getByText('Pročitano')).toBeVisible();
  });

  it('marks unread notifications as read and navigates on click', async () => {
    renderNotifications();

    fireEvent.click(screen.getByRole('button', { name: /obavijesti/i }));

    const unreadNotification = await screen.findByRole('button', {
      name: /novo pitanje na forumu novo/i,
    });
    fireEvent.click(unreadNotification);

    expect(mutateMarkAsRead).toHaveBeenCalledWith('1');
    expect(navigate).toHaveBeenCalledWith('/forum/questions/42');
    expect(within(unreadNotification).getByText('Pročitano')).toBeVisible();
  });

  it('keeps the mobile dropdown open until the user closes it', async () => {
    jest.useFakeTimers();
    renderNotifications(true);

    fireEvent.click(screen.getByRole('button', { name: /obavijesti/i }));
    expect(await screen.findByText('Novo pitanje na forumu')).toBeVisible();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText('Novo pitanje na forumu')).toBeVisible();
  });
});
