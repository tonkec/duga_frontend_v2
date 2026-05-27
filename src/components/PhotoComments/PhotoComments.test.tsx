import React from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import PhotoComments, { IComment } from '.';
import {
  useAddUploadComment,
  useDeleteUploadComment,
  useEditUploadComment,
  useGetUploadComments,
} from './hooks';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { useGetUserById } from '@app/hooks/useGetUserById';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import { useSocket } from '@app/context/useSocket';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';

jest.mock('@emoji-mart/data', () => ({}));

jest.mock('emoji-mart', () => ({
  init: jest.fn(),
  SearchIndex: {
    search: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('@app/components/MentionInput', () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  }) => (
    <input
      aria-label={placeholder}
      placeholder={placeholder}
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

jest.mock('@app/components/UserAvatar', () => ({
  __esModule: true,
  default: ({ avatarFallbackName }: { avatarFallbackName: string }) => (
    <span aria-label={`${avatarFallbackName} avatar`} />
  ),
}));

jest.mock('@app/components/ContentFormatter', () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

jest.mock('@app/components/RecordCreatedAt', () => ({
  __esModule: true,
  default: () => <span>just now</span>,
}));

jest.mock('@app/components/GiphySearch', () => ({
  __esModule: true,
  default: ({ isOpen, onGifSelect }: { isOpen: boolean; onGifSelect: (gifUrl: string) => void }) =>
    isOpen ? (
      <button type="button" onClick={() => onGifSelect('https://media.giphy.com/test.gif')}>
        Select test GIF
      </button>
    ) : null,
}));

jest.mock('@app/utils/consts', () => ({
  ALLOWED_FILE_TYPES: 'image/png,image/jpeg',
  MAXIMUM_NUMBER_OF_IMAGES: 5,
}));

jest.mock('@app/hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('@app/hooks/useGetUserById', () => ({
  useGetUserById: jest.fn(),
}));

jest.mock('@app/hooks/useGetAllUserImages', () => ({
  useGetAllUserImages: jest.fn(),
}));

jest.mock('@app/context/useSocket', () => ({
  useSocket: jest.fn(),
}));

jest.mock('@app/components/LatestUploads/hooks', () => ({
  useGetImageBlob: jest.fn(),
}));

jest.mock('./hooks', () => ({
  useAddUploadComment: jest.fn(),
  useDeleteUploadComment: jest.fn(),
  useEditUploadComment: jest.fn(),
  useGetUploadComments: jest.fn(),
}));

const mockUseAddUploadComment = jest.mocked(useAddUploadComment);
const mockUseDeleteUploadComment = jest.mocked(useDeleteUploadComment);
const mockUseEditUploadComment = jest.mocked(useEditUploadComment);
const mockUseGetUploadComments = jest.mocked(useGetUploadComments);
const mockUseGetCurrentUser = jest.mocked(useGetCurrentUser);
const mockUseGetUserById = jest.mocked(useGetUserById);
const mockUseGetAllUserImages = jest.mocked(useGetAllUserImages);
const mockUseSocket = jest.mocked(useSocket);
const mockUseGetImageBlob = jest.mocked(useGetImageBlob);

const mutateAddUploadComment = jest.fn();
const mutateEditUploadComment = jest.fn();
const mutateDeleteUploadComment = jest.fn();
const socketEmit = jest.fn();
const socketOn = jest.fn();
const socketOff = jest.fn();
const socketHandlers = new Map<string, (payload: unknown) => void>();

const existingComment: IComment = {
  id: 101,
  comment: 'Original comment',
  userId: '7',
  uploadId: '42',
  createdAt: '2026-05-23T12:00:00.000Z',
};

const renderPhotoComments = () =>
  render(
    <MemoryRouter initialEntries={['/photo/42']}>
      <Routes>
        <Route path="/photo/:photoId" element={<PhotoComments />} />
      </Routes>
    </MemoryRouter>
  );

describe('PhotoComments integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    socketHandlers.clear();
    mockUseSocket.mockReturnValue({
      on: socketOn.mockImplementation((event: string, handler: (payload: unknown) => void) => {
        socketHandlers.set(event, handler);
      }),
      off: socketOff,
      emit: socketEmit,
    } as unknown as ReturnType<typeof useSocket>);
    mockUseGetCurrentUser.mockReturnValue({
      user: {
        data: {
          id: '7',
        },
      },
    } as ReturnType<typeof useGetCurrentUser>);
    mockUseGetUserById.mockReturnValue({
      user: {
        data: {
          username: 'comment_owner',
        },
      },
      userError: null,
      isUserLoading: false,
    } as ReturnType<typeof useGetUserById>);
    mockUseGetAllUserImages.mockReturnValue({
      allUserImages: {
        data: [],
      },
      allUserImagesError: null,
      allUserImagesLoading: false,
    } as ReturnType<typeof useGetAllUserImages>);
    mockUseGetImageBlob.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
    } as ReturnType<typeof useGetImageBlob>);
    mockUseGetUploadComments.mockReturnValue({
      allComments: {
        data: [existingComment],
      },
      allCommentsError: null,
      areCommentsLoading: false,
    } as ReturnType<typeof useGetUploadComments>);
    mockUseAddUploadComment.mockReturnValue({
      mutateAddUploadComment,
      isAddingUploadComment: false,
      isAddUploadCommentError: false,
      isAddUploadCommentSuccess: false,
    } as ReturnType<typeof useAddUploadComment>);
    mockUseEditUploadComment.mockImplementation((onCommentUpdated) => ({
      mutateEditUploadComment: (payload) => {
        mutateEditUploadComment(payload);
        onCommentUpdated?.({
          data: {
            id: payload.id,
            comment: payload.comment,
            uploadId: payload.uploadId,
            taggedUsers: [],
          },
        });
      },
      isEditingUploadComment: false,
      isEditUploadCommentError: false,
      isEditUploadCommentSuccess: false,
    }));
    mockUseDeleteUploadComment.mockImplementation((onCommentDeleted) => ({
      mutateDeleteUploadComment: ({ commentId }) => {
        mutateDeleteUploadComment({ commentId, uploadId: '42' });
        onCommentDeleted?.(commentId);
      },
      isDeletingUploadComment: false,
      isDeleteUploadCommentError: false,
      isDeleteUploadCommentSuccess: false,
    }));
  });

  it('renders, creates, edits, and deletes comments', async () => {
    renderPhotoComments();

    expect(await screen.findByText('Original comment')).toBeVisible();
    expect(screen.getByRole('heading', { name: '1 komentara' })).toBeVisible();

    fireEvent.change(screen.getByPlaceholderText('Dodaj komentar'), {
      target: {
        value: 'New comment',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Pošalji' }));

    await waitFor(() => expect(mutateAddUploadComment).toHaveBeenCalled());
    const addFormData = mutateAddUploadComment.mock.calls[0][0] as FormData;
    expect(addFormData.get('uploadId')).toBe('42');
    expect(addFormData.get('comment')).toBe('New comment');

    fireEvent.click(screen.getByRole('button', { name: 'Izmijeni' }));
    fireEvent.change(screen.getByPlaceholderText('Izmijeni komentar'), {
      target: {
        value: 'Updated comment',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Spremi' }));

    await waitFor(() =>
      expect(mutateEditUploadComment).toHaveBeenCalledWith({
        id: 101,
        comment: 'Updated comment',
        taggedUserIds: [],
        uploadId: '42',
      })
    );
    expect(screen.getByText('Updated comment')).toBeVisible();
    expect(screen.queryByText('Original comment')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Obriši' }));
    expect(screen.getByRole('heading', { name: 'Obrisati komentar?' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Potvrđujem' }));

    await waitFor(() =>
      expect(mutateDeleteUploadComment).toHaveBeenCalledWith({ commentId: 101, uploadId: '42' })
    );
    expect(screen.queryByText('Updated comment')).not.toBeInTheDocument();
    expect(screen.getByText('Još nema komentara.')).toBeVisible();
  });

  it('ignores comment socket events for a different photo and cleans up by handler', async () => {
    const { unmount } = renderPhotoComments();

    expect(await screen.findByText('Original comment')).toBeVisible();

    act(() => {
      socketHandlers.get('receive-comment')?.({
        data: {
          id: 202,
          comment: 'Foreign comment',
          userId: '7',
          uploadId: '999',
          createdAt: '2026-05-23T12:01:00.000Z',
        },
      });
      socketHandlers.get('remove-comment')?.({
        data: {
          id: 101,
          uploadId: '999',
        },
      });
    });

    expect(screen.queryByText('Foreign comment')).not.toBeInTheDocument();
    expect(screen.getByText('Original comment')).toBeVisible();

    const receiveHandler = socketHandlers.get('receive-comment');
    const removeHandler = socketHandlers.get('remove-comment');
    unmount();

    expect(socketOff).toHaveBeenCalledWith('receive-comment', receiveHandler);
    expect(socketOff).toHaveBeenCalledWith('remove-comment', removeHandler);
  });

  it('creates a GIF-only photo comment', async () => {
    renderPhotoComments();

    fireEvent.click(screen.getByRole('button', { name: 'Dodaj GIF' }));
    fireEvent.click(screen.getByRole('button', { name: 'Select test GIF' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pošalji' }));

    await waitFor(() => expect(mutateAddUploadComment).toHaveBeenCalled());
    const addFormData = mutateAddUploadComment.mock.calls[0][0] as FormData;
    expect(addFormData.get('uploadId')).toBe('42');
    expect(addFormData.get('comment')).toBe('https://media.giphy.com/test.gif');
  });
});
