import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import ChatPage from '.';
import { useGetCurrentUser } from '../../hooks/useGetCurrentUser';
import { useGetUserById } from '../../hooks/useGetUserById';
import { useSocket } from '../../context/useSocket';
import { useDeleteCurrentChat, useGetAllMessages, useGetCurrentChat } from './hooks';

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

jest.mock('@app/hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('@app/hooks/useGetUserById', () => ({
  useGetUserById: jest.fn(),
}));

jest.mock('@app/context/useSocket', () => ({
  useSocket: jest.fn(),
}));

jest.mock('./hooks', () => ({
  useDeleteCurrentChat: jest.fn(),
  useGetAllMessages: jest.fn(),
  useGetCurrentChat: jest.fn(),
}));

jest.mock('@app/pages/ChatPage/hooks', () => ({
  useDeleteCurrentChat: jest.fn(),
  useGetAllMessages: jest.fn(),
  useGetCurrentChat: jest.fn(),
}));

const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);
const mockUseGetUserById = jest.mocked(useGetUserById);
const mockUseSocket = jest.mocked(useSocket);
const mockUseDeleteCurrentChat = jest.mocked(useDeleteCurrentChat);
const mockUseGetAllMessages = jest.mocked(useGetAllMessages);
const mockUseGetCurrentChat = jest.mocked(useGetCurrentChat);

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

const renderChatPage = () =>
  render(
    <MemoryRouter initialEntries={['/chat/123']}>
      <Routes>
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/new-chat" element={<h1>Messages page</h1>} />
      </Routes>
    </MemoryRouter>
  );

describe('ChatPage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSocket.mockReturnValue({
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
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
