import React from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import ChatPage from '.';
import { useGetCurrentUser } from '../../hooks/useGetCurrentUser';
import { useGetUserById } from '../../hooks/useGetUserById';
import { useSocket } from '../../context/useSocket';
import {
  useDeleteCurrentChat,
  useGetAllMessages,
  useGetCurrentChat,
  useLeaveCurrentChat,
} from './hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

jest.mock('@app/components/ConfirmModal', () => ({
  __esModule: true,
  default: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
    isOpen ? <div>{children}</div> : null,
}));

jest.mock('@app/components/ContentFormatter', () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

jest.mock('@app/components/LatestUploads/hooks', () => ({
  useGetImageBlob: () => ({
    data: null,
    error: null,
    isLoading: false,
  }),
}));

jest.mock('@app/pages/ChatPage/components/SendMessage', () => ({
  __esModule: true,
  default: () => <div data-testid="send-message">Send message form</div>,
}));

jest.mock('@app/pages/ChatPage/components/AddChatMembersModal', () => ({
  __esModule: true,
  default: ({
    onAddMembers,
  }: {
    onAddMembers: (users: Array<{ id: number; publicId?: string }>) => void;
  }) => (
    <button
      type="button"
      onClick={() => onAddMembers([{ id: 4, publicId: 'new-member-public-id' }])}
    >
      Confirm mocked add members
    </button>
  ),
}));

jest.mock('@app/hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('@app/hooks/useGetUserById', () => ({
  useGetUserById: jest.fn(),
}));

jest.mock('@app/hooks/useGetAllUsers', () => ({
  useGetAllUsers: () => ({
    allUsers: {
      data: [],
    },
    allUsersError: null,
    isAllUsersLoading: false,
  }),
}));

jest.mock('@app/context/useSocket', () => ({
  useSocket: jest.fn(),
}));

jest.mock('./hooks', () => ({
  useDeleteCurrentChat: jest.fn(),
  useGetAllMessages: jest.fn(),
  useGetCurrentChat: jest.fn(),
  useLeaveCurrentChat: jest.fn(),
}));

jest.mock('@app/pages/ChatPage/hooks', () => ({
  useDeleteCurrentChat: jest.fn(),
  useGetAllMessages: jest.fn(),
  useGetCurrentChat: jest.fn(),
  useLeaveCurrentChat: jest.fn(),
}));

const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);
const mockUseGetUserById = jest.mocked(useGetUserById);
const mockUseSocket = jest.mocked(useSocket);
const mockUseDeleteCurrentChat = jest.mocked(useDeleteCurrentChat);
const mockUseLeaveCurrentChat = jest.mocked(useLeaveCurrentChat);
const mockUseGetAllMessages = jest.mocked(useGetAllMessages);
const mockUseGetCurrentChat = jest.mocked(useGetCurrentChat);
const socketHandlers = new Map<string, (payload: unknown) => void>();
const socketOn = jest.fn();
const socketOff = jest.fn();
const socketEmit = jest.fn();

const currentUser = {
  id: 1,
  username: 'current_user',
};

const otherUser = {
  id: 2,
  username: 'chat_friend',
  status: 'offline',
};

const message = (id: number, fromUserId: number, text: string, createdAt: string) => ({
  id,
  fromUserId,
  message: text,
  createdAt,
  type: 'text' as const,
  User: {
    id: fromUserId,
  },
  securePhotoUrl: '',
  messagePhotoUrl: '',
  chatId: 123,
});

const renderChatPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/chat/123']}>
        <Routes>
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/new-chat" element={<h1>Messages page</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ChatPage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    socketHandlers.clear();
    socketOn.mockImplementation((event: string, handler: (payload: unknown) => void) => {
      socketHandlers.set(event, handler);
    });
    socketOff.mockImplementation((event: string) => {
      socketHandlers.delete(event);
    });

    mockUseSocket.mockReturnValue({
      on: socketOn,
      off: socketOff,
      emit: socketEmit,
    } as unknown as ReturnType<typeof useSocket>);

    mockUseGetCurrentUser.mockReturnValue({
      user: {
        data: currentUser,
      },
      userError: null,
      isUserLoading: false,
    } as ReturnType<typeof useGetCurrentUser>);

    mockUseGetUserById.mockReturnValue({
      user: {
        data: otherUser,
      },
      userError: null,
      isUserLoading: false,
    } as ReturnType<typeof useGetUserById>);

    mockUseGetCurrentChat.mockReturnValue({
      currentChat: {
        data: [{ userId: currentUser.id }, { userId: otherUser.id }],
      },
      currentChatError: null,
      isCurrentChatLoading: false,
      isCurrentChatSuccess: true,
      isCurrentChatError: false,
    } as ReturnType<typeof useGetCurrentChat>);

    mockUseDeleteCurrentChat.mockReturnValue({
      deleteChat: jest.fn(),
      isDeletingChat: false,
      isDeleteChatError: false,
      isDeleteChatSuccess: false,
    } as ReturnType<typeof useDeleteCurrentChat>);
    mockUseLeaveCurrentChat.mockReturnValue({
      leaveChat: jest.fn(),
      isLeavingChat: false,
      isLeaveChatError: false,
      isLeaveChatSuccess: false,
    } as ReturnType<typeof useLeaveCurrentChat>);
  });

  it('opens a chat and renders existing messages', () => {
    mockUseGetAllMessages.mockReturnValue({
      messages: [
        message(1, otherUser.id, 'Hey, welcome to this chat!', '2026-05-23T08:00:00.000Z'),
        message(2, currentUser.id, 'Thanks, happy to be here.', '2026-05-23T08:01:00.000Z'),
      ],
      allMessagesError: null,
      isAllMessagesLoading: false,
      isAllMessagesSuccess: true,
      fetchNextPage: jest.fn(),
    } as ReturnType<typeof useGetAllMessages>);

    renderChatPage();

    expect(screen.getByRole('heading', { name: otherUser.username })).toBeVisible();
    expect(screen.getByText('Offline')).toBeVisible();
    expect(screen.getByText('Hey, welcome to this chat!')).toBeVisible();
    expect(screen.getByText('Thanks, happy to be here.')).toBeVisible();
    expect(screen.getByTestId('send-message')).toBeVisible();
    expect(screen.queryByText('Nema poruka u ovom razgovoru')).not.toBeInTheDocument();
  });

  it('renders gif messages from their gif URL', () => {
    mockUseGetAllMessages.mockReturnValue({
      messages: [
        {
          ...message(1, otherUser.id, '', '2026-05-23T08:00:00.000Z'),
          type: 'gif',
          securePhotoUrl: 'chat/123/not-the-gif.gif',
          messagePhotoUrl: 'https://media.giphy.com/media/example/giphy.gif',
        },
      ],
      allMessagesError: null,
      isAllMessagesLoading: false,
      isAllMessagesSuccess: true,
      fetchNextPage: jest.fn(),
    } as ReturnType<typeof useGetAllMessages>);

    renderChatPage();

    expect(screen.getByAltText('gif')).toHaveAttribute(
      'src',
      'https://media.giphy.com/media/example/giphy.gif'
    );
  });

  it('renders the empty message state when the chat has no messages', () => {
    mockUseGetAllMessages.mockReturnValue({
      messages: [],
      allMessagesError: null,
      isAllMessagesLoading: false,
      isAllMessagesSuccess: true,
      fetchNextPage: jest.fn(),
    } as ReturnType<typeof useGetAllMessages>);

    renderChatPage();

    expect(screen.getByRole('heading', { name: otherUser.username })).toBeVisible();
    expect(screen.getByText('Nema poruka u ovom razgovoru')).toBeVisible();
  });

  it('shows the typing indicator for the other chat participant', () => {
    mockUseGetAllMessages.mockReturnValue({
      messages: [],
      allMessagesError: null,
      isAllMessagesLoading: false,
      isAllMessagesSuccess: true,
      fetchNextPage: jest.fn(),
    } as ReturnType<typeof useGetAllMessages>);

    renderChatPage();

    act(() => {
      socketHandlers.get('typing')?.({ chatId: '123', userId: otherUser.id });
    });

    expect(screen.getByRole('status', { name: 'Druga osoba piše' })).toBeVisible();

    act(() => {
      socketHandlers.get('stop-typing')?.({ chatId: '123', userId: otherUser.id });
    });

    expect(screen.queryByRole('status', { name: 'Druga osoba piše' })).not.toBeInTheDocument();
  });

  it('ignores typing and message socket events outside the current authorized chat context', () => {
    mockUseGetAllMessages.mockReturnValue({
      messages: [],
      allMessagesError: null,
      isAllMessagesLoading: false,
      isAllMessagesSuccess: true,
      fetchNextPage: jest.fn(),
    } as ReturnType<typeof useGetAllMessages>);

    renderChatPage();

    act(() => {
      socketHandlers.get('typing')?.({ chatId: '999', userId: otherUser.id });
      socketHandlers.get('typing')?.({ chatId: '123', userId: currentUser.id });
      socketHandlers.get('received')?.({
        ...message(99, otherUser.id, 'Cross-chat injected message', '2026-05-23T08:09:00.000Z'),
        chatId: 999,
      });
    });

    expect(screen.queryByRole('status', { name: 'Druga osoba piše' })).not.toBeInTheDocument();
    expect(screen.queryByText('Cross-chat injected message')).not.toBeInTheDocument();
  });

  it('emits group member additions without browser-supplied actor or admin fields', () => {
    mockUseGetCurrentChat.mockReturnValue({
      currentChat: {
        data: {
          id: 123,
          type: 'group',
          name: 'Admin group',
          Users: [
            { id: currentUser.id, username: currentUser.username, role: 'admin' },
            { id: otherUser.id, username: otherUser.username },
          ],
        },
      },
      currentChatError: null,
      isCurrentChatLoading: false,
      isCurrentChatSuccess: true,
      isCurrentChatError: false,
    } as ReturnType<typeof useGetCurrentChat>);
    mockUseGetAllMessages.mockReturnValue({
      messages: [],
      allMessagesError: null,
      isAllMessagesLoading: false,
      isAllMessagesSuccess: true,
      fetchNextPage: jest.fn(),
    } as ReturnType<typeof useGetAllMessages>);

    renderChatPage();

    fireEvent.click(screen.getByRole('button', { name: 'Dodaj osobe' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm mocked add members' }));

    expect(socketEmit).toHaveBeenCalledWith('add-user-to-group', {
      chatId: 123,
      userId: 4,
      userPublicId: 'new-member-public-id',
    });
    const addMemberPayloads = socketEmit.mock.calls
      .filter(([event]) => event === 'add-user-to-group')
      .map(([, payload]) => payload);

    addMemberPayloads.forEach((payload) => {
      ['currentUserId', 'fromUserId', 'role', 'isAdmin'].forEach((key) => {
        expect(payload).toEqual(expect.not.objectContaining({ [key]: expect.anything() }));
      });
    });
  });

  it('emits a socket event when reacting to a message', async () => {
    mockUseGetAllMessages.mockReturnValue({
      messages: [message(1, otherUser.id, 'React to me', '2026-05-23T08:00:00.000Z')],
      allMessagesError: null,
      isAllMessagesLoading: false,
      isAllMessagesSuccess: true,
      fetchNextPage: jest.fn(),
    } as ReturnType<typeof useGetAllMessages>);

    renderChatPage();

    screen.getByRole('button', { name: 'Dodaj reakciju' }).click();
    (await screen.findByRole('button', { name: 'Odaberi emoji 👍' })).click();

    expect(socketEmit).toHaveBeenCalledWith('react-message', {
      chatId: '123',
      messageId: 1,
      emoji: '👍',
    });
  });

  it('cleans up socket listeners with the exact registered handler references', () => {
    mockUseGetAllMessages.mockReturnValue({
      messages: [],
      allMessagesError: null,
      isAllMessagesLoading: false,
      isAllMessagesSuccess: true,
      fetchNextPage: jest.fn(),
    } as ReturnType<typeof useGetAllMessages>);

    const { unmount } = renderChatPage();
    const registeredHandlers = new Map(
      socketOn.mock.calls.map(([event, handler]) => [event, handler])
    );

    unmount();

    registeredHandlers.forEach((handler, event) => {
      expect(socketOff).toHaveBeenCalledWith(event, handler);
    });
  });

  it('renders a loading state while the chat is loading', () => {
    mockUseGetCurrentChat.mockReturnValue({
      currentChat: undefined,
      currentChatError: null,
      isCurrentChatLoading: true,
      isCurrentChatSuccess: false,
      isCurrentChatError: false,
    } as ReturnType<typeof useGetCurrentChat>);
    mockUseGetAllMessages.mockReturnValue({
      messages: [],
      allMessagesError: null,
      isAllMessagesLoading: false,
      isAllMessagesSuccess: false,
      fetchNextPage: jest.fn(),
    } as ReturnType<typeof useGetAllMessages>);

    renderChatPage();

    expect(screen.getByRole('status', { name: 'Učitavanje...' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: otherUser.username })).not.toBeInTheDocument();
  });

  it('redirects to messages when the chat fails to load', async () => {
    mockUseGetCurrentChat.mockReturnValue({
      currentChat: undefined,
      currentChatError: new Error('chat not found'),
      isCurrentChatLoading: false,
      isCurrentChatSuccess: false,
      isCurrentChatError: true,
    } as ReturnType<typeof useGetCurrentChat>);
    mockUseGetAllMessages.mockReturnValue({
      messages: [],
      allMessagesError: null,
      isAllMessagesLoading: false,
      isAllMessagesSuccess: false,
      fetchNextPage: jest.fn(),
    } as ReturnType<typeof useGetAllMessages>);

    renderChatPage();

    expect(await screen.findByRole('heading', { name: 'Messages page' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: otherUser.username })).not.toBeInTheDocument();
  });
});
