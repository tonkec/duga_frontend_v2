import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SendMessage, { getMessageImagePath } from '.';
import { useSocket } from '@app/context/useSocket';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import { useGetAllNotifcations, useMarkAsReadNotification } from '@app/components/Navigation/hooks';
import { useUploadMessageImage } from './hooks';

jest.mock('@emoji-mart/data', () => ({}));

jest.mock('emoji-mart', () => ({
  init: jest.fn(),
  SearchIndex: {
    search: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('@app/components/GiphySearch', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@app/utils/consts', () => ({
  ALLOWED_FILE_TYPES: 'image/png,image/jpeg',
  MAXIMUM_NUMBER_OF_IMAGES: 5,
}));

jest.mock('@app/context/useSocket', () => ({
  useSocket: jest.fn(),
}));

jest.mock('@app/hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('@app/hooks/useGetAllUserChats', () => ({
  useGetAllUserChats: jest.fn(),
}));

jest.mock('@app/hooks/useGetAllUserImages', () => ({
  useGetAllUserImages: jest.fn(),
}));

jest.mock('@app/components/Navigation/hooks', () => ({
  useGetAllNotifcations: jest.fn(),
  useMarkAsReadNotification: jest.fn(),
}));

jest.mock('./hooks', () => ({
  useUploadMessageImage: jest.fn(),
}));

const mockUseSocket = jest.mocked(useSocket);
const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);
const mockUseGetAllUserChats = jest.mocked(useGetAllUserChats);
const mockUseGetAllUserImages = jest.mocked(useGetAllUserImages);
const mockUseGetAllNotifications = jest.mocked(useGetAllNotifcations);
const mockUseMarkAsReadNotification = jest.mocked(useMarkAsReadNotification);
const mockUseUploadMessageImage = jest.mocked(useUploadMessageImage);

const socketEmit = jest.fn();
const mutateMarkAsRead = jest.fn();
const uploadMessageImage = jest.fn();
const messageInputPlaceholder = 'Napiši poruku… ( @ za mention, : za emoji )';

const renderSendMessage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SendMessage chatId="123" otherUserId={2} />
    </QueryClientProvider>
  );
};

describe('SendMessage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSocket.mockReturnValue({
      emit: socketEmit,
      on: jest.fn(),
      off: jest.fn(),
    } as unknown as ReturnType<typeof useSocket>);
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
    mockUseGetAllUserChats.mockReturnValue({
      userChats: {
        data: [
          {
            id: 123,
            Users: [{ id: 1 }, { id: 2 }],
          },
        ],
      },
      userChatsError: null,
      isUserChatsLoading: false,
    } as ReturnType<typeof useGetAllUserChats>);
    mockUseGetAllUserImages.mockReturnValue({
      allUserImages: {
        data: [],
      },
      allUserImagesError: null,
      allUserImagesLoading: false,
    } as ReturnType<typeof useGetAllUserImages>);
    mockUseGetAllNotifications.mockReturnValue({
      allNotifications: {
        data: [
          {
            id: 55,
            type: 'message',
            chatId: 123,
            isRead: false,
          },
        ],
      },
      areAllNotificationsLoading: false,
      allNotificationsError: null,
    } as ReturnType<typeof useGetAllNotifcations>);
    mockUseMarkAsReadNotification.mockReturnValue({
      mutateMarkAsRead,
      isMarkingAsRead: false,
      isMarkAsReadError: false,
      isMarkAsReadSuccess: false,
    } as ReturnType<typeof useMarkAsReadNotification>);
    mockUseUploadMessageImage.mockReturnValue({
      uploadMessageImage,
      isUploadingMessageImage: false,
      isError: false,
      isSuccess: false,
    } as ReturnType<typeof useUploadMessageImage>);
  });

  it('sends a text message and marks unread chat notifications as read', async () => {
    renderSendMessage();

    const input = screen.getByPlaceholderText(messageInputPlaceholder);
    fireEvent.focus(input);

    expect(socketEmit).toHaveBeenCalledWith('typing', {
      chatId: '123',
      userId: 1,
      toUserId: [2],
    });
    expect(socketEmit).toHaveBeenCalledWith('markAsRead', {
      userId: 1,
      chatId: 123,
    });
    expect(mutateMarkAsRead).toHaveBeenCalledWith('55');

    fireEvent.change(input, {
      target: {
        value: 'Hello from the integration test',
      },
    });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    await waitFor(() =>
      expect(socketEmit).toHaveBeenCalledWith('message', {
        type: 'text',
        fromUserId: 1,
        fromUser: {
          id: 1,
          username: 'current_user',
        },
        toUserId: [2],
        chatId: '123',
        message: 'Hello from the integration test',
        mentions: [],
      })
    );
    expect(input).toHaveValue('');
    expect(socketEmit).toHaveBeenCalledWith('stop-typing', {
      chatId: '123',
      userId: 1,
      toUserId: [2],
    });
  });

  it('emits typing while the draft changes and stops when it is cleared', () => {
    renderSendMessage();

    const input = screen.getByPlaceholderText(messageInputPlaceholder);

    fireEvent.change(input, {
      target: {
        value: 'H',
      },
    });

    expect(socketEmit).toHaveBeenCalledWith('typing', {
      chatId: '123',
      userId: 1,
      toUserId: [2],
    });

    fireEvent.change(input, {
      target: {
        value: '',
      },
    });

    expect(socketEmit).toHaveBeenCalledWith('stop-typing', {
      chatId: '123',
      userId: 1,
      toUserId: [2],
    });
  });

  it('builds uploaded image message paths with the cleaned uploaded filename', () => {
    expect(getMessageImagePath('123', '987654321', 'My Chat-Photo.PNG')).toBe(
      'chat/123/987654321/mychatphoto.png'
    );
  });
});
