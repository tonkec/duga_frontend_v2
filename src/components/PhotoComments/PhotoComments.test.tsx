import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    mockUseSocket.mockReturnValue({
      on: jest.fn(),
      off: jest.fn(),
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
      mutateDeleteUploadComment: (commentId) => {
        mutateDeleteUploadComment(commentId);
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

    await waitFor(() => expect(mutateDeleteUploadComment).toHaveBeenCalledWith(101));
    expect(screen.queryByText('Updated comment')).not.toBeInTheDocument();
    expect(screen.getByText('Još nema komentara.')).toBeVisible();
  });
});
