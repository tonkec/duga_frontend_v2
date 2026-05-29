import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { addUploadComment } from '@app/api/uploadsComments';
import { useSocket } from '@app/context/useSocket';
import { useAddUploadComment } from '.';

jest.mock('@app/api/uploadsComments', () => ({
  addUploadComment: jest.fn(),
}));

jest.mock('@app/api/users', () => ({
  getUsersByUsernames: jest.fn(),
}));

jest.mock('@app/context/useSocket', () => ({
  useSocket: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockAddUploadComment = jest.mocked(addUploadComment);
const mockUseSocket = jest.mocked(useSocket);
const mockToast = jest.mocked(toast);

const socketEmit = jest.fn();

const AddUploadCommentHarness = () => {
  const { mutateAddUploadComment, isAddingUploadComment } = useAddUploadComment();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const formData = new FormData();
          formData.append('uploadId', '42');
          formData.append('comment', 'Nice photo');
          mutateAddUploadComment(formData);
        }}
      >
        Add photo comment
      </button>
      <span data-testid="status">{isAddingUploadComment ? 'adding' : 'idle'}</span>
    </>
  );
};

const renderAddUploadComment = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AddUploadCommentHarness />
    </QueryClientProvider>
  );
};

describe('useAddUploadComment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSocket.mockReturnValue({
      emit: socketEmit,
      on: jest.fn(),
      off: jest.fn(),
    } as unknown as ReturnType<typeof useSocket>);
  });

  it('emits the added photo comment after a successful upload', async () => {
    const addedComment = {
      id: 101,
      uploadId: '42',
      comment: 'Nice photo',
      userId: '7',
    };

    mockAddUploadComment.mockResolvedValue({
      data: addedComment,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {},
      },
    } as AxiosResponse);

    renderAddUploadComment();

    fireEvent.click(screen.getByRole('button', { name: 'Add photo comment' }));

    await waitFor(() => expect(mockAddUploadComment).toHaveBeenCalledWith(expect.any(FormData)));
    await waitFor(() => expect(socketEmit).toHaveBeenCalledWith('send-comment', addedComment));
    expect(mockToast.success).toHaveBeenCalledWith('Komentar uspješno dodan.', expect.any(Object));
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('shows Rekognition rejection reasons without emitting the photo comment', async () => {
    mockAddUploadComment.mockRejectedValue({
      response: {
        data: {
          errors: [
            { reason: 'Amazon Rekognition nije pronašao lice na fotografiji.' },
            { reason: 'Fotografija ne smije sadržavati eksplicitan sadržaj.' },
          ],
        },
      },
    });

    renderAddUploadComment();

    fireEvent.click(screen.getByRole('button', { name: 'Add photo comment' }));

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith(
        'Amazon Rekognition nije pronašao lice na fotografiji. Fotografija ne smije sadržavati eksplicitan sadržaj.',
        expect.any(Object)
      )
    );
    expect(socketEmit).not.toHaveBeenCalled();
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it('shows string API errors without emitting the photo comment', async () => {
    mockAddUploadComment.mockRejectedValue({
      response: {
        data: {
          errors: ['csrf_failed'],
        },
      },
    });

    renderAddUploadComment();

    fireEvent.click(screen.getByRole('button', { name: 'Add photo comment' }));

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith('csrf_failed', expect.any(Object))
    );
    expect(socketEmit).not.toHaveBeenCalled();
    expect(mockToast.success).not.toHaveBeenCalled();
  });
});
