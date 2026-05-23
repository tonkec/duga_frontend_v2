import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import NewMessageModal from '.';
import { useGetAllUsers } from '../../../../hooks/useGetAllUsers';
import { useGetAllUserChats } from '../../../../hooks/useGetAllUserChats';
import { useGetCurrentUser } from '../../../../hooks/useGetCurrentUser';
import { useCreateNewChat } from '../../hooks';

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

const mockUseGetAllUsers = jest.mocked(useGetAllUsers);
const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);
const mockUseGetAllUserChats = jest.mocked(useGetAllUserChats);
const mockUseCreateNewChat = jest.mocked(useCreateNewChat);

const onCreateChat = jest.fn();

const currentUser = {
  id: 1,
  username: 'current_user',
};

const availableUser = {
  id: 2,
  username: 'available_match',
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

    mockUseGetAllUsers.mockReturnValue({
      allUsers: {
        data: [currentUser, availableUser],
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

    expect(onCreateChat).toHaveBeenCalledWith({ partnerId: availableUser.id });
  });
});
