import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { uploadMessagePhotos } from '@app/api/uploads';
import { useUploadMessageImage } from '.';

jest.mock('@app/api/uploads', () => ({
  uploadMessagePhotos: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockUploadMessagePhotos = jest.mocked(uploadMessagePhotos);
const mockToast = jest.mocked(toast);

const emitImageToSockets = jest.fn();
const clearSelectedFiles = jest.fn();

const UploadMessageImageHarness = () => {
  const { uploadMessageImage, isUploadingMessageImage } = useUploadMessageImage(
    emitImageToSockets,
    clearSelectedFiles
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const formData = new FormData();
          formData.append('chatId', '123');
          uploadMessageImage(formData);
        }}
      >
        Upload chat photo
      </button>
      <span data-testid="status">{isUploadingMessageImage ? 'uploading' : 'idle'}</span>
    </>
  );
};

const renderUploadMessageImage = () => {
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
      <UploadMessageImageHarness />
    </QueryClientProvider>
  );
};

describe('useUploadMessageImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('emits the chat photo and clears selected files after a successful upload', async () => {
    mockUploadMessagePhotos.mockResolvedValue({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {},
      },
    } as AxiosResponse);

    renderUploadMessageImage();

    fireEvent.click(screen.getByRole('button', { name: 'Upload chat photo' }));

    await waitFor(() => expect(mockUploadMessagePhotos).toHaveBeenCalledWith(expect.any(FormData)));
    await waitFor(() => expect(emitImageToSockets).toHaveBeenCalledTimes(1));
    expect(clearSelectedFiles).toHaveBeenCalledTimes(1);
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('shows Rekognition rejection reasons and clears selected files without emitting the chat photo', async () => {
    mockUploadMessagePhotos.mockRejectedValue({
      response: {
        data: {
          errors: [
            { reason: 'Amazon Rekognition nije pronašao lice na fotografiji.' },
            { reason: 'Fotografija ne smije sadržavati eksplicitan sadržaj.' },
          ],
        },
      },
    });

    renderUploadMessageImage();

    fireEvent.click(screen.getByRole('button', { name: 'Upload chat photo' }));

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith(
        'Amazon Rekognition nije pronašao lice na fotografiji. Fotografija ne smije sadržavati eksplicitan sadržaj.',
        expect.any(Object)
      )
    );
    expect(emitImageToSockets).not.toHaveBeenCalled();
    expect(clearSelectedFiles).toHaveBeenCalledTimes(1);
  });

  it('shows string API errors and clears selected files without emitting the chat photo', async () => {
    mockUploadMessagePhotos.mockRejectedValue({
      response: {
        data: {
          errors: ['csrf_failed'],
        },
      },
    });

    renderUploadMessageImage();

    fireEvent.click(screen.getByRole('button', { name: 'Upload chat photo' }));

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith('csrf_failed', expect.any(Object))
    );
    expect(emitImageToSockets).not.toHaveBeenCalled();
    expect(clearSelectedFiles).toHaveBeenCalledTimes(1);
  });
});
