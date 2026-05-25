import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import MyProfilePage from '.';
import { useSocket } from '@app/context/useSocket';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import { useQuestionDetails, useQuestions } from '@app/features/forum/hooks/useForum';

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

jest.mock('@app/components/UserProfileCard', () => ({
  __esModule: true,
  default: ({
    user,
  }: {
    user: {
      username: string;
      status: string;
      location: string;
      age: number;
      bio: string;
      gender: string;
      sexuality: string;
      lookingFor: string;
      relationshipStatus: string;
      favoriteDayOfWeek: string;
      interests: string;
      languages: string;
    };
  }) => (
    <section>
      <h1>{user.username}</h1>
      <p>{user.status === 'online' ? 'Online' : 'Offline'}</p>
      <p>
        {user.location} , {user.age} godina
      </p>
      <p>{user.bio}</p>
      <p>{user.gender}</p>
      <p>{user.sexuality}</p>
      <p>{user.lookingFor === 'friendship' ? 'Prijateljstvo' : user.lookingFor}</p>
      <p>{user.relationshipStatus === 'single' ? 'Single' : user.relationshipStatus}</p>
      <p>{user.favoriteDayOfWeek === 'friday' ? 'Petak' : user.favoriteDayOfWeek}</p>
      <p>{user.interests}</p>
      <p>{user.languages}</p>
    </section>
  ),
}));

jest.mock('@app/components/Photos', () => ({
  __esModule: true,
  default: () => <div>Photos</div>,
}));

jest.mock('@app/components/ContentFormatter', () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

jest.mock('./components/AllUserPhotos', () => ({
  __esModule: true,
  default: () => <div>All user photos</div>,
  getForumPhotos: jest.fn(() => []),
}));

jest.mock('@app/hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('@app/hooks/useGetAllImages', () => ({
  useGetAllImages: jest.fn(),
}));

jest.mock('@app/hooks/useGetAllUserImages', () => ({
  useGetAllUserImages: jest.fn(),
}));

jest.mock('@app/context/useSocket', () => ({
  useSocket: jest.fn(),
}));

jest.mock('@app/features/forum/hooks/useForum', () => ({
  useQuestionDetails: jest.fn(),
  useQuestions: jest.fn(),
}));

const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);
const mockUseGetAllImages = jest.mocked(useGetAllImages);
const mockUseGetAllUserImages = jest.mocked(useGetAllUserImages);
const mockUseSocket = jest.mocked(useSocket);
const mockUseQuestions = jest.mocked(useQuestions);
const mockUseQuestionDetails = jest.mocked(useQuestionDetails);

const profileUser = {
  id: 1,
  username: 'profile_owner',
  age: 32,
  status: 'online',
  bio: 'I like long walks and reliable tests.',
  location: 'Zagreb',
  gender: 'Nebinarna osoba',
  sexuality: 'Queer',
  lookingFor: 'friendship',
  relationshipStatus: 'single',
  cigarettes: false,
  alcohol: true,
  sport: true,
  favoriteDayOfWeek: 'friday',
  spirituality: 'Mostly curious.',
  embarasement: '',
  tooOldFor: '',
  makesMyDay: 'Good coffee.',
  favoriteSong: '',
  favoriteMovie: '',
  interests: 'music, testing',
  languages: 'hrvatski, english',
  ending: 'See you around.',
};

const renderProfilePage = () =>
  render(
    <MemoryRouter>
      <MyProfilePage />
    </MemoryRouter>
  );

describe('MyProfilePage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSocket.mockReturnValue({
      on: jest.fn(),
      off: jest.fn(),
    } as unknown as ReturnType<typeof useSocket>);
    mockUseGetCurrentUser.mockReturnValue({
      user: {
        data: profileUser,
      },
      userError: null,
      isUserLoading: false,
    } as ReturnType<typeof useGetCurrentUser>);
    mockUseGetAllImages.mockReturnValue({
      allImages: {
        data: {
          images: [],
        },
      },
      allImagesError: null,
      allImagesLoading: false,
    } as ReturnType<typeof useGetAllImages>);
    mockUseGetAllUserImages.mockReturnValue({
      allUserImages: {
        data: {
          images: [],
        },
      },
      allUserImagesError: null,
      allUserImagesLoading: false,
    } as ReturnType<typeof useGetAllUserImages>);
    mockUseQuestions.mockReturnValue({
      data: { data: [], total: 0, page: 1, limit: 100, totalPages: 0 },
      isError: false,
      isPending: false,
    } as unknown as ReturnType<typeof useQuestions>);
    mockUseQuestionDetails.mockReturnValue([] as ReturnType<typeof useQuestionDetails>);
  });

  it('loads and renders current user profile data', () => {
    renderProfilePage();

    expect(screen.getByRole('heading', { name: 'Moj profil' })).toBeVisible();
    expect(screen.getByRole('heading', { name: profileUser.username })).toBeVisible();
    expect(screen.getByText('Online')).toBeVisible();
    expect(screen.getByText('Zagreb , 32 godina')).toBeVisible();
    expect(screen.getByText(profileUser.bio)).toBeVisible();
    expect(screen.getByText(profileUser.gender)).toBeVisible();
    expect(screen.getByText(profileUser.sexuality)).toBeVisible();
    expect(screen.getByText('Prijateljstvo')).toBeVisible();
    expect(screen.getByText('Single')).toBeVisible();
    expect(screen.getByText('Petak')).toBeVisible();
    expect(screen.getByText(profileUser.interests)).toBeVisible();
    expect(screen.getByText(profileUser.languages)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Dopuni profil' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Započni razgovor' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Istraži korisnike' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Postavi pitanje' })).toBeVisible();
  });

  it('renders the loading state while profile images are loading', () => {
    mockUseGetAllImages.mockReturnValue({
      allImages: undefined,
      allImagesError: null,
      allImagesLoading: true,
    } as ReturnType<typeof useGetAllImages>);

    renderProfilePage();

    expect(screen.getByRole('status', { name: 'Učitavanje...' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: profileUser.username })).not.toBeInTheDocument();
  });
});
