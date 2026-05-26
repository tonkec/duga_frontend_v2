import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import UserAvatar from '.';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import { useGetProfilePhoto } from './hooks/useGetProfilePhoto';

jest.mock('react-avatar', () => ({
  __esModule: true,
  default: ({ name, src }: { name: string; src?: string }) =>
    src ? <img src={src} alt="profile placeholder" /> : <span>{name}</span>,
}));

jest.mock('@app/components/LatestUploads/hooks', () => ({
  useGetImageBlob: jest.fn(),
}));

jest.mock('@app/hooks/useImage', () => ({
  __esModule: true,
  default: () => false,
}));

jest.mock('./hooks/useGetProfilePhoto', () => ({
  useGetProfilePhoto: jest.fn(),
}));

const mockUseGetImageBlob = jest.mocked(useGetImageBlob);
const mockUseGetProfilePhoto = jest.mocked(useGetProfilePhoto);
const createObjectURLMock = jest.fn(() => 'blob:uploaded-profile-image');

describe('UserAvatar integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: createObjectURLMock,
    });
    mockUseGetProfilePhoto.mockReturnValue({
      profilePhoto: undefined,
      profilePhotoError: null,
      isProfilePhotoLoading: false,
    } as ReturnType<typeof useGetProfilePhoto>);
    mockUseGetImageBlob.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
    } as ReturnType<typeof useGetImageBlob>);
  });

  it('renders a profile placeholder when the user has no image', () => {
    render(
      <UserAvatar avatarFallbackName="No Image User" color="#2D46B9" userId="123" size="160" />
    );

    expect(screen.getByText('No Image User')).toBeVisible();
  });

  it('renders the uploaded profile image when it is available', () => {
    const profileBlob = new Blob(['profile image'], { type: 'image/png' });
    mockUseGetProfilePhoto.mockReturnValue({
      profilePhoto: {
        data: {
          securePhotoUrl: '/uploads/profile-image',
        },
      },
      profilePhotoError: null,
      isProfilePhotoLoading: false,
    } as ReturnType<typeof useGetProfilePhoto>);
    mockUseGetImageBlob.mockReturnValue({
      data: profileBlob,
      error: null,
      isLoading: false,
    } as ReturnType<typeof useGetImageBlob>);

    render(
      <UserAvatar avatarFallbackName="Uploaded User" color="#2D46B9" userId="123" size="160" />
    );

    expect(mockUseGetImageBlob).toHaveBeenCalledWith('/uploads/profile-image');
    expect(createObjectURLMock).toHaveBeenCalledWith(profileBlob);
    expect(screen.getByRole('img', { name: 'Avatar' })).toHaveAttribute(
      'src',
      'blob:uploaded-profile-image'
    );
  });

  it('falls back to the profile placeholder when the uploaded image is missing', () => {
    mockUseGetProfilePhoto.mockReturnValue({
      profilePhoto: {
        data: {
          securePhotoUrl: '/uploads/missing-profile-image',
        },
      },
      profilePhotoError: null,
      isProfilePhotoLoading: false,
    } as ReturnType<typeof useGetProfilePhoto>);
    mockUseGetImageBlob.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
    } as ReturnType<typeof useGetImageBlob>);

    render(
      <UserAvatar avatarFallbackName="Broken Image User" color="#2D46B9" userId="123" size="160" />
    );

    expect(mockUseGetImageBlob).toHaveBeenCalledWith('/uploads/missing-profile-image');
    expect(createObjectURLMock).not.toHaveBeenCalled();
    expect(screen.getByText('Broken Image User')).toBeVisible();
  });
});
