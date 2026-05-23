import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import EditMyProfilePage from '.';
import { useGetCurrentUser } from '../../hooks/useGetCurrentUser';

jest.mock('@app/components/AppLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@app/components/PhotoUploader', () => ({
  __esModule: true,
  default: () => <div>Photo uploader</div>,
}));

jest.mock('@app/hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('./hooks', () => ({
  useUpdateUser: () => ({
    updateUserMutation: jest.fn(),
  }),
}));

const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);

const currentUser = {
  id: 1,
  username: 'prefilled_user',
  age: '34',
  location: 'Zagreb',
  gender: 'Nebinarna osoba',
  sexuality: 'Queer',
  bio: 'Existing one-line bio',
  lookingFor: 'friendship',
  relationshipStatus: 'single',
  cigarettes: true,
  alcohol: false,
  sports: true,
  sport: true,
  favoriteDayOfWeek: 'friday',
  spirituality: 'Existing spirituality text',
  embarasement: 'Existing embarrassing story',
  tooOldFor: 'Existing too old for answer',
  makesMyDay: 'Existing day-maker answer',
  favoriteSong: 'https://www.youtube.com/embed/song',
  favoriteMovie: 'https://www.youtube.com/embed/movie',
  interests: 'music, testing',
  languages: 'hrvatski, english',
  ending: 'Existing ending text',
};

const renderEditPage = () =>
  render(
    <MemoryRouter>
      <EditMyProfilePage />
    </MemoryRouter>
  );

describe('EditMyProfilePage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetCurrentUser.mockReturnValue({
      user: {
        data: currentUser,
      },
      userError: null,
      isUserLoading: false,
    } as ReturnType<typeof useGetCurrentUser>);
  });

  it('pre-fills the edit form with existing user values', async () => {
    renderEditPage();

    expect(screen.getByRole('heading', { name: 'Uredi profil' })).toBeVisible();

    await waitFor(() =>
      expect(screen.getByPlaceholderText('Korisničko ime')).toHaveValue(currentUser.username)
    );

    expect(screen.getByPlaceholderText('Godine')).toHaveValue(currentUser.age);
    expect(screen.getByPlaceholderText('Rod')).toHaveValue(currentUser.gender);
    expect(screen.getByPlaceholderText('Seksualnost')).toHaveValue(currentUser.sexuality);
    expect(screen.getByPlaceholderText('Reci nešto o sebi jednom rečenicom')).toHaveValue(
      currentUser.bio
    );
    expect(screen.getByText('Zagreb')).toBeVisible();
    expect(screen.getByText('Prijateljstvo')).toBeVisible();
    expect(screen.getByText('Single')).toBeVisible();
    expect(screen.getByText('Petak')).toBeVisible();
    expect(screen.getByLabelText('Cigarete')).toBeChecked();
    expect(screen.getByLabelText('Alkohol')).not.toBeChecked();
    expect(screen.getByLabelText('Sport')).toBeChecked();
    expect(screen.getByPlaceholderText('Najsramotnija stvar koja mi se dogodila...')).toHaveValue(
      currentUser.embarasement
    );
    expect(screen.getByPlaceholderText('Imam previše godina za....')).toHaveValue(
      currentUser.tooOldFor
    );
    expect(screen.getByPlaceholderText('Dan mi je ljepši ako...')).toHaveValue(
      currentUser.makesMyDay
    );
    expect(
      screen.getByPlaceholderText('Najdraža youtube pjesma (https://www.youtube.com/embed/)')
    ).toHaveValue(currentUser.favoriteSong);
    expect(
      screen.getByPlaceholderText('Trailer za najdraži film (https://www.youtube.com/embed/)')
    ).toHaveValue(currentUser.favoriteMovie);
    expect(
      screen.getByPlaceholderText('Reci nam nešto o svojoj duhovnosti/religioznosti')
    ).toHaveValue(currentUser.spirituality);
    expect(screen.getByPlaceholderText('Interesi (odvojeni zarezom)')).toHaveValue(
      currentUser.interests
    );
    expect(screen.getByPlaceholderText('Jezici koje govorim (odvojeni zarezom)')).toHaveValue(
      currentUser.languages
    );
    expect(screen.getByPlaceholderText('Za kraj još nešto o meni')).toHaveValue(currentUser.ending);
  });
});
