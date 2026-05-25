import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import OtherUserPage from '.';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import { useGetAllUserChats } from '../../hooks/useGetAllUserChats';
import { useGetUserById } from '../../hooks/useGetUserById';
import { useQuestionDetails, useQuestions } from '../../features/forum/hooks/useForum';

jest.mock('@app/components/AppLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@app/components/UserProfileCard', () => ({
  __esModule: true,
  default: ({ user }: { user: { username: string } }) => <h1>{user.username}</h1>,
}));

jest.mock('@app/components/Photos', () => ({
  __esModule: true,
  default: () => <div>Photos</div>,
}));

jest.mock('@app/hooks/useGetAllImages', () => ({
  useGetAllImages: jest.fn(),
}));

jest.mock('@app/hooks/useGetAllUserChats', () => ({
  useGetAllUserChats: jest.fn(),
}));

jest.mock('@app/hooks/useGetUserById', () => ({
  useGetUserById: jest.fn(),
}));

jest.mock('@app/pages/NewChatPage/hooks', () => ({
  useCreateNewChat: () => ({
    onCreateChat: jest.fn(),
  }),
}));

jest.mock('@app/features/forum/hooks/useForum', () => ({
  useQuestionDetails: jest.fn(),
  useQuestions: jest.fn(),
}));

const mockUseGetAllImages = jest.mocked(useGetAllImages);
const mockUseGetAllUserChats = jest.mocked(useGetAllUserChats);
const mockUseGetUserById = jest.mocked(useGetUserById);
const mockUseQuestions = jest.mocked(useQuestions);
const mockUseQuestionDetails = jest.mocked(useQuestionDetails);

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const otherUser = {
  id: 42,
  username: 'existing_friend',
};

const existingChat = {
  id: 777,
  type: 'private',
  Users: [otherUser],
  Messages: [],
};

const renderOtherUserPage = () =>
  render(
    <MemoryRouter initialEntries={['/user/42']}>
      <LocationProbe />
      <Routes>
        <Route path="/user/:userId" element={<OtherUserPage />} />
        <Route path="/chat/:chatId" element={<h1>Chat page</h1>} />
      </Routes>
    </MemoryRouter>
  );

describe('OtherUserPage existing chat integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetAllImages.mockReturnValue({
      allImages: {
        data: {
          images: [],
        },
      },
      allImagesError: null,
      allImagesLoading: false,
    } as ReturnType<typeof useGetAllImages>);

    mockUseGetUserById.mockReturnValue({
      user: {
        data: otherUser,
      },
      userError: null,
      isUserLoading: false,
    } as ReturnType<typeof useGetUserById>);
    mockUseQuestions.mockReturnValue({
      data: { data: [], total: 0, page: 1, limit: 100, totalPages: 0 },
      isError: false,
      isPending: false,
    } as unknown as ReturnType<typeof useQuestions>);
    mockUseQuestionDetails.mockReturnValue([] as ReturnType<typeof useQuestionDetails>);
  });

  it('shows Nastavi razgovor when chat already exists with the user', () => {
    mockUseGetAllUserChats.mockReturnValue({
      userChats: {
        data: [existingChat],
      },
      userChatsError: null,
      isUserChatsLoading: false,
    } as ReturnType<typeof useGetAllUserChats>);

    renderOtherUserPage();

    const continueButton = screen.getByRole('button', { name: 'Nastavi razgovor' });

    expect(continueButton).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Započni razgovor' })).not.toBeInTheDocument();

    fireEvent.click(continueButton);

    expect(screen.getByTestId('location')).toHaveTextContent('/chat/777');
  });

  it('shows Započni razgovor when chat does not exist with the user', () => {
    mockUseGetAllUserChats.mockReturnValue({
      userChats: {
        data: [],
      },
      userChatsError: null,
      isUserChatsLoading: false,
    } as ReturnType<typeof useGetAllUserChats>);

    renderOtherUserPage();

    expect(screen.getByRole('button', { name: 'Započni razgovor' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Nastavi razgovor' })).not.toBeInTheDocument();
  });
});
