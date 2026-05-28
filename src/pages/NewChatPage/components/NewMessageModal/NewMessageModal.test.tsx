import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import NewMessageModal from '.';
import { useGetAllUsers } from '../../../../hooks/useGetAllUsers';
import { useGetAllUserChats } from '../../../../hooks/useGetAllUserChats';
import { useGetCurrentUser } from '../../../../hooks/useGetCurrentUser';
import { useCreateNewChat } from '../../hooks';
import { useSocket } from '../../../../context/useSocket';

jest.mock('react-modal', () => ({
  __esModule: true,
  default: Object.assign(
    ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
      isOpen ? <div>{children}</div> : null,
    {
      setAppElement: jest.fn(),
    }
  ),
}));

jest.mock('@app/components/UserAvatar', () => ({
  __esModule: true,
  default: ({ avatarFallbackName }: { avatarFallbackName: string }) => (
    <span aria-label={`${avatarFallbackName} avatar`} />
  ),
}));

jest.mock('@app/hooks/useGetAllUsers', () => ({
  useGetAllUsers: jest.fn(),
}));

jest.mock('@app/hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('@app/hooks/useGetAllUserChats', () => ({
  useGetAllUserChats: jest.fn(),
}));

jest.mock('@app/pages/NewChatPage/hooks', () => ({
  useCreateNewChat: jest.fn(),
}));

jest.mock('@app/context/useSocket', () => ({
  useSocket: jest.fn(),
}));

const mockUseGetAllUsers = jest.mocked(useGetAllUsers);
const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);
const mockUseGetAllUserChats = jest.mocked(useGetAllUserChats);
const mockUseCreateNewChat = jest.mocked(useCreateNewChat);
const mockUseSocket = jest.mocked(useSocket);

const onCreateChat = jest.fn();
const socketEmit = jest.fn();
const forbiddenSocketActorKeys = ['currentUserId', 'fromUserId', 'fromUser', 'role', 'isAdmin'];

const currentUser = {
  id: 1,
  username: 'current_user',
};

const availableUser = {
  id: 2,
  username: 'available_match',
  publicId: 'available-public-id',
  isVerified: true,
};

const secondAvailableUser = {
  id: 3,
  username: 'second_match',
  publicId: 'second-public-id',
  isVerified: true,
};

const renderModal = () =>
  render(
    <MemoryRouter>
      <NewMessageModal isOpen onClose={jest.fn()} />
    </MemoryRouter>
  );

describe('NewMessageModal creating chat disabled state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    onCreateChat.mockReset();
    socketEmit.mockReset();

    mockUseGetAllUsers.mockReturnValue({
      allUsers: {
        data: [currentUser, availableUser, secondAvailableUser],
      },
      allUsersError: null,
      isAllUsersLoading: false,
    } as ReturnType<typeof useGetAllUsers>);

    mockUseGetCurrentUser.mockReturnValue({
      user: {
        data: currentUser,
      },
      userError: null,
      isUserLoading: false,
    } as ReturnType<typeof useGetCurrentUser>);

    mockUseGetAllUserChats.mockReturnValue({
      userChats: {
        data: [],
      },
      userChatsError: null,
      isUserChatsLoading: false,
    } as ReturnType<typeof useGetAllUserChats>);

    mockUseSocket.mockReturnValue({
      emit: socketEmit,
    } as unknown as ReturnType<typeof useSocket>);
  });

  it('disables user options while a chat is being created', () => {
    mockUseCreateNewChat.mockReturnValue({
      onCreateChat,
      isCreatingChat: true,
      isCreateChatError: false,
      isCreateChatSuccess: false,
    } as ReturnType<typeof useCreateNewChat>);

    renderModal();

    const userOption = screen.getByRole('option', { name: /available_match/ });

    expect(userOption).toBeDisabled();

    fireEvent.click(userOption);

    expect(onCreateChat).not.toHaveBeenCalled();
  });

  it('allows selecting a user when chat creation is idle', () => {
    mockUseCreateNewChat.mockReturnValue({
      onCreateChat,
      isCreatingChat: false,
      isCreateChatError: false,
      isCreateChatSuccess: false,
    } as ReturnType<typeof useCreateNewChat>);

    renderModal();

    fireEvent.click(screen.getByRole('option', { name: /available_match/ }));

    expect(onCreateChat).toHaveBeenCalledWith({ partnerPublicId: availableUser.publicId });
  });

  it('emits minimal group member identifiers after creating a group', () => {
    onCreateChat.mockImplementation((_payload, options) => {
      options?.onSuccess?.({
        id: 123,
        type: 'group',
        name: 'Test grupa',
        Users: [currentUser, availableUser, secondAvailableUser],
        Messages: [],
      });
    });
    mockUseCreateNewChat.mockReturnValue({
      onCreateChat,
      isCreatingChat: false,
      isCreateChatError: false,
      isCreateChatSuccess: false,
    } as ReturnType<typeof useCreateNewChat>);

    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Grupa' }));
    fireEvent.change(screen.getByPlaceholderText('Naziv grupe'), {
      target: { value: 'Test grupa' },
    });
    fireEvent.click(screen.getByRole('option', { name: /available_match/ }));
    fireEvent.click(screen.getByRole('option', { name: /second_match/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Kreiraj grupu' }));

    expect(onCreateChat).toHaveBeenCalledWith(
      {
        userPublicIds: [availableUser.publicId, secondAvailableUser.publicId],
        name: 'Test grupa',
      },
      expect.any(Object)
    );
    expect(socketEmit).toHaveBeenCalledWith('add-user-to-group', {
      chatId: 123,
      userId: availableUser.id,
      userPublicId: availableUser.publicId,
    });
    expect(socketEmit).toHaveBeenCalledWith('add-user-to-group', {
      chatId: 123,
      userId: secondAvailableUser.id,
      userPublicId: secondAvailableUser.publicId,
    });
    expect(socketEmit).not.toHaveBeenCalledWith(
      'add-user-to-group',
      expect.objectContaining({
        chat: expect.anything(),
      })
    );
    socketEmit.mock.calls
      .filter(([event]) => event === 'add-user-to-group')
      .forEach(([, payload]) => {
        forbiddenSocketActorKeys.forEach((key) => {
          expect(payload).toEqual(expect.not.objectContaining({ [key]: expect.anything() }));
        });
      });
  });

  it('does not emit group membership socket events before the create call succeeds', () => {
    mockUseCreateNewChat.mockReturnValue({
      onCreateChat,
      isCreatingChat: false,
      isCreateChatError: false,
      isCreateChatSuccess: false,
    } as ReturnType<typeof useCreateNewChat>);

    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Grupa' }));
    fireEvent.change(screen.getByPlaceholderText('Naziv grupe'), {
      target: { value: 'Test grupa' },
    });
    fireEvent.click(screen.getByRole('option', { name: /available_match/ }));
    fireEvent.click(screen.getByRole('option', { name: /second_match/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Kreiraj grupu' }));

    expect(onCreateChat).toHaveBeenCalled();
    expect(socketEmit).not.toHaveBeenCalledWith('add-user-to-group', expect.anything());
  });
});
