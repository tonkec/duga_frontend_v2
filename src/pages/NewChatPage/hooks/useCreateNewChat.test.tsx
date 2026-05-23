import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router';
import { toast } from 'react-toastify';
import { useCreateNewChat } from '.';

const mockCreateChat = jest.fn();

jest.mock('@app/api/chats', () => ({
  createChat: (input: unknown) => mockCreateChat(input),
}));

jest.mock('@app/api/chatMessages', () => ({
  isMessageRead: jest.fn(),
  markMessagesAsRead: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockToast = jest.mocked(toast);

const CreateChatHarness = () => {
  const { onCreateChat, isCreatingChat } = useCreateNewChat();

  return (
    <>
      <button type="button" onClick={() => onCreateChat({ partnerId: 42 })}>
        Create chat
      </button>
      <span data-testid="status">{isCreatingChat ? 'creating' : 'idle'}</span>
    </>
  );
};

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const renderCreateChat = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/new-chat']}>
        <CreateChatHarness />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('useCreateNewChat integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a chat and navigates to the created chat page', async () => {
    mockCreateChat.mockResolvedValue({
      data: [
        {
          id: 987,
          type: 'private',
          Users: [],
          Messages: [],
        },
      ],
    });

    renderCreateChat();

    fireEvent.click(screen.getByRole('button', { name: 'Create chat' }));

    await waitFor(() => expect(mockCreateChat).toHaveBeenCalledWith({ partnerId: 42 }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/chat/987'));
    expect(mockToast.success).toHaveBeenCalledWith('Razgovor uspješno kreiran', expect.any(Object));
  });

  it('shows an error and keeps the current route when chat creation fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockCreateChat.mockRejectedValue(new Error('failed to create chat'));

    renderCreateChat();

    fireEvent.click(screen.getByRole('button', { name: 'Create chat' }));

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith('Došlo je do greške.', expect.any(Object))
    );
    expect(screen.getByTestId('location')).toHaveTextContent('/new-chat');

    consoleErrorSpy.mockRestore();
  });
});
