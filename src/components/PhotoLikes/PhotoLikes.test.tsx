import React from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import PhotoLikes from '.';
import { useSocket } from '@app/context/useSocket';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { useDownvoteUpload, useGetUploadUpvotes, useUpvoteUpload } from './hooks';

jest.mock('@app/context/useSocket', () => ({
  useSocket: jest.fn(),
}));

jest.mock('@app/hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('./hooks', () => ({
  useDownvoteUpload: jest.fn(),
  useGetUploadUpvotes: jest.fn(),
  useUpvoteUpload: jest.fn(),
}));

jest.mock('@app/components/UserAvatar', () => ({
  __esModule: true,
  default: ({ avatarFallbackName }: { avatarFallbackName: string }) => (
    <span>{avatarFallbackName}</span>
  ),
}));

const mockUseSocket = jest.mocked(useSocket);
const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);
const mockUseUpvoteUpload = jest.mocked(useUpvoteUpload);
const mockUseDownvoteUpload = jest.mocked(useDownvoteUpload);
const mockUseGetUploadUpvotes = jest.mocked(useGetUploadUpvotes);

const mutateUpvoteUpload = jest.fn();
const mutateDownvoteUpload = jest.fn();
const socketOn = jest.fn();
const socketOff = jest.fn();
const socketHandlers: Record<
  string,
  (payload: { uploadId: number; likes: { id: number; userId: string }[] }) => void
> = {};

const renderPhotoLikes = () =>
  render(
    <MemoryRouter>
      <PhotoLikes photoId="42" />
    </MemoryRouter>
  );

describe('PhotoLikes integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(socketHandlers).forEach((event) => delete socketHandlers[event]);
    mockUseSocket.mockReturnValue({
      on: socketOn.mockImplementation((event, handler) => {
        socketHandlers[event] = handler;
      }),
      off: socketOff,
      emit: jest.fn(),
    } as unknown as ReturnType<typeof useSocket>);
    mockUseGetCurrentUser.mockReturnValue({
      user: {
        data: {
          id: 1,
          username: 'photo_liker',
        },
      },
      userError: null,
      isUserLoading: false,
    } as ReturnType<typeof useGetCurrentUser>);
    mockUseGetUploadUpvotes.mockReturnValue({
      allUploadUpvotes: {
        data: [],
      },
      allUploadUpvotesError: null,
      areUploadUpvotesLoading: false,
      areUploadUpvotesSuccess: true,
    } as ReturnType<typeof useGetUploadUpvotes>);
    mockUseUpvoteUpload.mockReturnValue({
      mutateUpvoteUpload,
      isUpvotingUpload: false,
      isUpvoteUploadError: false,
      isUpvoteUploadSuccess: false,
    } as ReturnType<typeof useUpvoteUpload>);
    mockUseDownvoteUpload.mockReturnValue({
      mutateDownvoteUpload,
      isDownvotingUpload: false,
      isDownvoteUploadError: false,
      isDownvoteUploadSuccess: false,
    } as ReturnType<typeof useDownvoteUpload>);
  });

  it('likes and unlikes a photo when the socket updates the like state', () => {
    renderPhotoLikes();

    expect(screen.getByText('Nema lajkova')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Lajkaj fotografiju' }));

    expect(mutateUpvoteUpload).toHaveBeenCalledWith({ uploadId: '42' });

    act(() => {
      socketHandlers['upvote-upload']({
        uploadId: 42,
        likes: [{ id: 10, userId: '1' }],
      });
    });

    expect(screen.getByText('1 lajk')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Ukloni lajk' }));

    expect(mutateDownvoteUpload).toHaveBeenCalledWith({ uploadId: '42' });

    act(() => {
      socketHandlers['downvote-upload']({
        uploadId: 42,
        likes: [],
      });
    });

    expect(screen.getByText('Nema lajkova')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Lajkaj fotografiju' })).toBeVisible();
  });
});
