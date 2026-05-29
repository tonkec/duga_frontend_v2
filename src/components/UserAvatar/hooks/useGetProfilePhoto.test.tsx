import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAllImages, getProfilePhoto } from '@app/api/uploads';
import { useGetProfilePhoto } from './useGetProfilePhoto';

jest.mock('@app/api/uploads', () => ({
  getAllImages: jest.fn(),
  getProfilePhoto: jest.fn(),
}));

const mockGetAllImages = jest.mocked(getAllImages);
const mockGetProfilePhoto = jest.mocked(getProfilePhoto);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useGetProfilePhoto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the profile-photo endpoint when it returns an image source', async () => {
    mockGetProfilePhoto.mockResolvedValue({
      data: {
        securePhotoUrl: '/uploads/profile-photo.png',
      },
    } as Awaited<ReturnType<typeof getProfilePhoto>>);

    const { result } = renderHook(() => useGetProfilePhoto('7'), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.profilePhoto?.data).toEqual({
        securePhotoUrl: '/uploads/profile-photo.png',
      })
    );
    expect(mockGetAllImages).not.toHaveBeenCalled();
  });

  it('falls back to the user images endpoint when profile-photo has no readable source', async () => {
    mockGetProfilePhoto.mockResolvedValue({
      data: {},
    } as Awaited<ReturnType<typeof getProfilePhoto>>);
    mockGetAllImages.mockResolvedValue({
      data: {
        images: [
          { id: 1, isProfilePhoto: false, securePhotoUrl: '/uploads/other.png' },
          { id: 2, isProfilePhoto: true, securePhotoUrl: '/uploads/profile-from-gallery.png' },
        ],
      },
    } as Awaited<ReturnType<typeof getAllImages>>);

    const { result } = renderHook(() => useGetProfilePhoto('7'), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.profilePhoto?.data).toMatchObject({
        id: 2,
        securePhotoUrl: '/uploads/profile-from-gallery.png',
      })
    );
    expect(mockGetAllImages).toHaveBeenCalledWith('7');
  });

  it('falls back to the user images endpoint when profile-photo fails', async () => {
    mockGetProfilePhoto.mockRejectedValue({ response: { status: 404 } });
    mockGetAllImages.mockResolvedValue({
      data: {
        images: [{ id: 3, isProfilePhoto: true, url: 'uploads/profile-from-fallback.png' }],
      },
    } as Awaited<ReturnType<typeof getAllImages>>);

    const { result } = renderHook(() => useGetProfilePhoto('7'), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.profilePhoto?.data).toMatchObject({
        id: 3,
        url: 'uploads/profile-from-fallback.png',
      })
    );
    expect(mockGetAllImages).toHaveBeenCalledWith('7');
  });
});
