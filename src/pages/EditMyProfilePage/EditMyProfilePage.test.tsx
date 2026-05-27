import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import EditMyProfilePage from '.';
import { useGetCurrentUser } from '../../hooks/useGetCurrentUser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

const updateUserMutation = jest.fn();

jest.mock('./hooks', () => ({
  useUpdateUser: () => ({
    updateUserMutation,
  }),
}));

jest.mock('@app/api/youtube', () => ({
  searchYouTubeVideos: jest.fn(),
}));

const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);
const mockSearchYouTubeVideos = jest.requireMock('@app/api/youtube')
  .searchYouTubeVideos as jest.Mock;

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
  favoriteMovie: 'https://www.imdb.com/title/tt0111161/',
  interests: 'music, testing',
  languages: 'hrvatski, english',
  ending: 'Existing ending text',
};

const renderEditPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <EditMyProfilePage />
      </QueryClientProvider>
    </MemoryRouter>
  );
};

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
    expect(screen.getByText(currentUser.favoriteSong)).toBeVisible();
    expect(screen.getByText(currentUser.favoriteMovie)).toBeVisible();
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

  it('saves changed profile values through the update mutation', async () => {
    renderEditPage();

    await waitFor(() =>
      expect(screen.getByPlaceholderText('Korisničko ime')).toHaveValue(currentUser.username)
    );

    fireEvent.change(screen.getByPlaceholderText('Rod'), {
      target: {
        value: 'Trans žena',
      },
    });
    fireEvent.change(screen.getByPlaceholderText('Seksualnost'), {
      target: {
        value: 'Lezbijka',
      },
    });
    fireEvent.change(screen.getByPlaceholderText('Reci nešto o sebi jednom rečenicom'), {
      target: {
        value: 'Updated one-line bio',
      },
    });
    fireEvent.change(screen.getByPlaceholderText('Dan mi je ljepši ako...'), {
      target: {
        value: 'Updated day-maker answer',
      },
    });
    fireEvent.change(screen.getByPlaceholderText('Interesi (odvojeni zarezom)'), {
      target: {
        value: 'books, hiking',
      },
    });
    fireEvent.click(screen.getByLabelText('Cigarete'));
    fireEvent.click(screen.getByLabelText('Alkohol'));

    expect(screen.getByPlaceholderText('Rod')).toHaveValue('Trans žena');
    expect(screen.getByPlaceholderText('Seksualnost')).toHaveValue('Lezbijka');
    expect(screen.getByPlaceholderText('Reci nešto o sebi jednom rečenicom')).toHaveValue(
      'Updated one-line bio'
    );
    expect(screen.getByPlaceholderText('Dan mi je ljepši ako...')).toHaveValue(
      'Updated day-maker answer'
    );
    expect(screen.getByPlaceholderText('Interesi (odvojeni zarezom)')).toHaveValue('books, hiking');
    expect(screen.getByLabelText('Cigarete')).not.toBeChecked();
    expect(screen.getByLabelText('Alkohol')).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'Spremi' }));

    await waitFor(() =>
      expect(updateUserMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'Trans žena',
          sexuality: 'Lezbijka',
          bio: 'Updated one-line bio',
          makesMyDay: 'Updated day-maker answer',
          interests: 'books, hiking',
          cigarettes: false,
          alcohol: true,
        })
      )
    );
  });

  it('shows validation errors and does not save invalid profile values', async () => {
    renderEditPage();

    await waitFor(() =>
      expect(screen.getByPlaceholderText('Korisničko ime')).toHaveValue(currentUser.username)
    );

    fireEvent.change(screen.getByPlaceholderText('Reci nešto o sebi jednom rečenicom'), {
      target: {
        value: 'x'.repeat(101),
      },
    });
    fireEvent.change(screen.getByPlaceholderText('Interesi (odvojeni zarezom)'), {
      target: {
        value: 'x'.repeat(201),
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Spremi' }));

    expect(await screen.findAllByText('Polje ne smije biti dulje od 100 znakova.')).toHaveLength(1);
    expect(screen.getByText('Polje ne smije biti dulje od 200 znakova.')).toBeVisible();
    expect(updateUserMutation).not.toHaveBeenCalled();
  });

  it('searches YouTube songs and saves the selected video URL', async () => {
    mockSearchYouTubeVideos.mockResolvedValue([
      {
        id: 'dQw4w9WgXcQ',
        title: 'Favorite Song',
        channelTitle: 'Favorite Channel',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      },
    ]);

    renderEditPage();

    await waitFor(() =>
      expect(screen.getByPlaceholderText('Korisničko ime')).toHaveValue(currentUser.username)
    );

    fireEvent.change(screen.getByPlaceholderText('Pretraži YouTube pjesmu...'), {
      target: {
        value: 'favorite song',
      },
    });

    expect(await screen.findByText('Favorite Song')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /Favorite Song/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Spremi' }));

    await waitFor(() =>
      expect(updateUserMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          favoriteSong: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        })
      )
    );
  });
});
