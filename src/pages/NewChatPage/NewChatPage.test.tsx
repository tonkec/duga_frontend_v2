import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import NewChatPage from '.';
import { useGetAllUserChats } from '../../hooks/useGetAllUserChats';
import { useGetCurrentUser } from '../../hooks/useGetCurrentUser';

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

jest.mock('@app/pages/NewChatPage/components/NewMessageModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role="dialog">Mock new message modal</div> : null,
}));

jest.mock('@app/hooks/useGetAllUserChats', () => ({
  useGetAllUserChats: jest.fn(),
}));

jest.mock('@app/hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('@app/pages/NewChatPage/hooks', () => ({
  useGetIsMessageRead: () => ({
    isMessageReadData: {
      data: {
        is_read: true,
      },
    },
  }),
  useMarkMessagesAsRead: () => ({
    onMarkMessagesAsRead: jest.fn(),
  }),
}));

let cookieState: Record<string, string | undefined> = { cookieAccepted: 'true' };

jest.mock('react-cookie', () => ({
  useCookies: () => [cookieState],
}));

const mockUseGetAllUserChats = jest.mocked(useGetAllUserChats);
const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);

const user = (id: number, username: string) => ({
  id,
  username,
  firstName: '',
  lastName: '',
  email: `${username}@example.com`,
  avatar: '',
  bio: '',
  gender: '',
  isVerified: true,
  location: '',
  password: '',
  sexuality: '',
  updatedAt: '2026-05-23T07:00:00.000Z',
  age: 30,
  status: 'offline' as const,
});

const textMessage = (id: number, message: string, createdAt: string, fromUserId: number) => ({
  id,
  message,
  content: message,
  createdAt,
  User: user(fromUserId, `user_${fromUserId}`),
  fromUserId,
  chatId: id,
  type: 'text',
  securePhotoUrl: '',
  messagePhotoUrl: '',
});

const chat = (id: number, username: string, message: string, createdAt: string) => ({
  id,
  type: 'private',
  createdAt,
  Users: [user(id + 100, username)],
  Messages: [textMessage(id + 1000, message, createdAt, id + 100)],
  ChatUser: {
    userId: '1',
    chatId: id,
    createdAt,
    updatedAt: createdAt,
  },
});

const renderNewChatPage = () =>
  render(
    <MemoryRouter initialEntries={['/new-chat']}>
      <NewChatPage />
    </MemoryRouter>
  );

describe('NewChatPage chat list integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cookieState = { cookieAccepted: 'true' };
    mockUseGetCurrentUser.mockReturnValue({
      user: {
        data: {
          id: 1,
          username: 'current_user',
        },
      },
      userError: null,
      isUserLoading: false,
    } as ReturnType<typeof useGetCurrentUser>);
  });

  it('loads and renders conversations with latest message previews', () => {
    mockUseGetAllUserChats.mockReturnValue({
      userChats: {
        data: [
          chat(10, 'older_friend', 'This is the older conversation', '2026-05-23T07:00:00.000Z'),
          chat(11, 'newer_friend', 'This is the newest conversation', '2026-05-23T08:00:00.000Z'),
          {
            ...chat(12, 'empty_friend', '', '2026-05-23T09:00:00.000Z'),
            Messages: [],
          },
        ],
      },
      userChatsError: null,
      isUserChatsLoading: false,
    } as ReturnType<typeof useGetAllUserChats>);

    renderNewChatPage();

    expect(screen.getByRole('heading', { name: 'Poruke' })).toBeVisible();
    expect(screen.getByText('2 aktivna razgovora')).toBeVisible();
    expect(screen.getByText('newer_friend')).toBeVisible();
    expect(screen.getByText('This is the newest conversation')).toBeVisible();
    expect(screen.getByText('older_friend')).toBeVisible();
    expect(screen.getByText('This is the older conversation')).toBeVisible();
    expect(screen.queryByText('empty_friend')).not.toBeInTheDocument();
  });

  it('opens the new message modal from the empty state', () => {
    mockUseGetAllUserChats.mockReturnValue({
      userChats: {
        data: [
          {
            ...chat(12, 'empty_friend', '', '2026-05-23T09:00:00.000Z'),
            Messages: [],
          },
        ],
      },
      userChatsError: null,
      isUserChatsLoading: false,
    } as ReturnType<typeof useGetAllUserChats>);

    renderNewChatPage();

    expect(screen.getByRole('heading', { name: 'Nema razgovora' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Pronađi korisnike' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('Mock new message modal');
  });

  it('disables chat when cookies are rejected', () => {
    cookieState = { cookieRejectedAt: '2026-05-23T12:00:00.000Z' };
    mockUseGetAllUserChats.mockReturnValue({
      userChats: {
        data: [chat(10, 'cookie_blocked_friend', 'Can you read this?', '2026-05-23T07:00:00.000Z')],
      },
      userChatsError: null,
      isUserChatsLoading: false,
    } as ReturnType<typeof useGetAllUserChats>);

    renderNewChatPage();

    expect(
      screen.getByText(
        'Nije moguće slati poruke jer si odbio_la kolačiće. Ako želiš slati poruke, molimo te da prihvatiš kolačiće u postavkama.'
      )
    ).toBeVisible();
    expect(screen.queryByText('cookie_blocked_friend')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nova poruka' })).not.toBeInTheDocument();
  });

  it('enables chat when cookies are accepted', () => {
    cookieState = { cookieAccepted: 'true' };
    mockUseGetAllUserChats.mockReturnValue({
      userChats: {
        data: [
          chat(10, 'cookie_enabled_friend', 'Cookies are accepted', '2026-05-23T07:00:00.000Z'),
        ],
      },
      userChatsError: null,
      isUserChatsLoading: false,
    } as ReturnType<typeof useGetAllUserChats>);

    renderNewChatPage();

    expect(screen.getByText('cookie_enabled_friend')).toBeVisible();
    expect(screen.getByText('Cookies are accepted')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Nova poruka' })).toBeVisible();
    expect(
      screen.queryByText(/Nije moguće slati poruke jer si odbio_la kolačiće/)
    ).not.toBeInTheDocument();
  });
});
