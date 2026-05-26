import React from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import NotificationDropdown, { INotification } from '.';
import { useSocket } from '@app/context/useSocket';
import {
  useGetAllNotifcations,
  useMarkAllAsReadNotifications,
  useMarkAsReadNotification,
} from '@app/components/Navigation/hooks';
import { getQuestions } from '@app/features/forum/api/forumApi';

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

jest.mock('@app/features/forum/api/forumApi', () => ({
  getQuestion: jest.fn(),
  getQuestions: jest.fn(),
}));

const mockUseSocket = jest.mocked(useSocket);
const mockUseGetAllNotifications = jest.mocked(useGetAllNotifcations);
const mockUseMarkAllAsReadNotifications = jest.mocked(useMarkAllAsReadNotifications);
const mockUseMarkAsReadNotification = jest.mocked(useMarkAsReadNotification);
const mockGetQuestions = jest.mocked(getQuestions);

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

    mockGetQuestions.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
    });
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

  it('navigates forum answer notifications to the related question', async () => {
    mockUseGetAllNotifications.mockReturnValue({
      allNotifications: {
        data: [
          notification({
            id: 3,
            content: 'Netko je odgovorio na tvoje pitanje.',
            actionType: 'forum_answer',
            actionId: 42,
          }),
        ],
      },
      allNotificationsError: null,
      areAllNotificationsLoading: false,
    } as ReturnType<typeof useGetAllNotifcations>);

    renderNotifications();

    fireEvent.click(screen.getByRole('button', { name: /obavijesti/i }));
    fireEvent.click(
      await screen.findByRole('button', {
        name: /netko je odgovorio na tvoje pitanje/i,
      })
    );

    expect(navigate).toHaveBeenCalledWith('/forum/questions/42');
  });

  it('resolves reply-to-answer notifications from answer id to question id', async () => {
    mockUseGetAllNotifications.mockReturnValue({
      allNotifications: {
        data: [
          notification({
            id: 4,
            content: 'Netko je odgovorio na tvoj odgovor.',
            actionType: 'forum_answer',
            actionId: 11,
          }),
        ],
      },
      allNotificationsError: null,
      areAllNotificationsLoading: false,
    } as ReturnType<typeof useGetAllNotifcations>);
    mockGetQuestions.mockResolvedValue({
      data: [
        {
          id: 42,
          userId: 7,
          title: 'Pitanje',
          body: 'Sadrzaj',
          isResolved: false,
          createdAt: '2026-05-25T10:00:00.000Z',
          updatedAt: '2026-05-25T10:00:00.000Z',
          Answers: [
            {
              id: 11,
              questionId: 42,
              userId: 7,
              body: 'Odgovor',
              isAccepted: false,
              createdAt: '2026-05-25T10:00:00.000Z',
              updatedAt: '2026-05-25T10:00:00.000Z',
            },
          ],
        },
      ],
      total: 1,
      page: 1,
      limit: 100,
    });

    renderNotifications();

    fireEvent.click(screen.getByRole('button', { name: /obavijesti/i }));
    fireEvent.click(
      await screen.findByRole('button', {
        name: /netko je odgovorio na tvoj odgovor/i,
      })
    );

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/forum/questions/42'));
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
