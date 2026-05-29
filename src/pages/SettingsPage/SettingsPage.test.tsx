import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import SettingsPage from '.';
import { useDeleteUser } from '../EditMyProfilePage/hooks';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { useGetAllImages } from '@app/hooks/useGetAllImages';

jest.mock('@app/components/AppLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@app/components/ConfirmModal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    onConfirm,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div role="dialog">
        {children}
        <button type="button" onClick={onConfirm}>
          Potvrđujem
        </button>
        <button type="button" onClick={onClose}>
          Natrag
        </button>
      </div>
    ) : null,
}));

jest.mock('@app/components/Navigation/components/OnlineStatus', () => ({
  __esModule: true,
  default: () => <div>Online status toggle</div>,
}));

jest.mock('@app/components/UserAvatar', () => ({
  __esModule: true,
  default: ({
    avatarFallbackName,
    profilePhoto,
  }: {
    avatarFallbackName: string;
    profilePhoto?: { securePhotoUrl?: string };
  }) => (
    <span aria-label={`${avatarFallbackName} avatar`}>
      {profilePhoto?.securePhotoUrl || avatarFallbackName}
    </span>
  ),
}));

jest.mock('react-cookie', () => ({
  useCookies: () => [{ cookieAccepted: true }],
}));

jest.mock('@app/hooks/useCookieConsent', () => ({
  useCookieConsent: () => ({
    acceptCookies: jest.fn(),
    rejectCookies: jest.fn(),
  }),
}));

jest.mock('@app/hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('@app/hooks/useGetAllImages', () => ({
  useGetAllImages: jest.fn(),
}));

jest.mock('../EditMyProfilePage/hooks', () => ({
  useDeleteUser: jest.fn(),
}));

const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);
const mockUseGetAllImages = jest.mocked(useGetAllImages);
const mockUseDeleteUser = jest.mocked(useDeleteUser);
const deleteUserMutation = jest.fn();

describe('SettingsPage integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetCurrentUser.mockReturnValue({
      user: {
        data: {
          id: 1,
          username: 'settings_user',
        },
      },
      userError: null,
      isUserLoading: false,
    } as ReturnType<typeof useGetCurrentUser>);
    mockUseGetAllImages.mockReturnValue({
      allImages: undefined,
      allImagesError: null,
      allImagesLoading: false,
    } as ReturnType<typeof useGetAllImages>);
    mockUseDeleteUser.mockReturnValue({
      deleteUserMutation,
      isUserPending: false,
      isUserUpdatingError: false,
      isUserUpdatingSuccess: false,
    } as ReturnType<typeof useDeleteUser>);
  });

  it('deletes the user account after confirmation', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('heading', { name: 'Postavke' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'settings_user' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Obriši profil' }));

    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Obrisati profil?' })).toBeVisible();
    expect(
      screen.getByText('Brisanje profila briše sve tvoje fotografije, komentare, lajkove i poruke.')
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Potvrđujem' }));

    expect(deleteUserMutation).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('passes the current user profile photo from uploads to the avatar', () => {
    mockUseGetAllImages.mockReturnValue({
      allImages: {
        data: {
          images: [
            { id: 1, isProfilePhoto: false, securePhotoUrl: '/uploads/other-photo.png' },
            { id: 2, isProfilePhoto: true, securePhotoUrl: '/uploads/settings-profile.png' },
          ],
        },
      },
      allImagesError: null,
      allImagesLoading: false,
    } as ReturnType<typeof useGetAllImages>);

    render(<SettingsPage />);

    expect(screen.getByLabelText('settings_user avatar')).toHaveTextContent(
      '/uploads/settings-profile.png'
    );
  });
});
