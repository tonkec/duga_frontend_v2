import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { apiClient } from '@app/api';
import { useGetImageBlob } from '.';

jest.mock('@app/api', () => ({
  apiClient: jest.fn(),
}));

jest.mock('@app/api/uploads', () => ({
  getLatestUploads: jest.fn(),
}));

const mockApiClient = jest.mocked(apiClient);
const get = jest.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return wrapper;
};

describe('useGetImageBlob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.mockReturnValue({ get } as unknown as ReturnType<typeof apiClient>);
  });

  it('fetches relative backend media paths through the authenticated API client', async () => {
    const imageBlob = new Blob(['image'], { type: 'image/png' });
    get.mockResolvedValue({ data: imageBlob, headers: { 'content-type': 'image/png' } });

    const { result } = renderHook(() => useGetImageBlob('uploads/photo.png'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBe(imageBlob));

    expect(mockApiClient).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('/uploads/photo.png', {
      responseType: 'blob',
      skipGlobalErrorHandler: true,
    });
  });

  it('rejects fetched SVG blobs before object URL creation', async () => {
    const svgBlob = new Blob(['<svg />'], { type: 'image/svg+xml' });
    get.mockResolvedValue({ data: svgBlob, headers: { 'content-type': 'image/svg+xml' } });

    const { result } = renderHook(() => useGetImageBlob('uploads/vector.svg'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeNull());
  });

  it('rejects fetched blobs without an allowed image content type', async () => {
    const htmlBlob = new Blob(['<html></html>'], { type: 'text/html' });
    get.mockResolvedValue({ data: htmlBlob, headers: { 'content-type': 'text/html' } });

    const { result } = renderHook(() => useGetImageBlob('uploads/not-image.png'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeNull());
  });

  it('rejects fetched blobs when the response omits Content-Type', async () => {
    const imageBlob = new Blob(['image'], { type: 'image/png' });
    get.mockResolvedValue({ data: imageBlob, headers: {} });

    const { result } = renderHook(() => useGetImageBlob('uploads/photo.png'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeNull());
  });

  it('does not create an API client for absolute media URLs', () => {
    renderHook(() => useGetImageBlob('https://example.com/uploads/photo.png'), {
      wrapper: createWrapper(),
    });

    expect(mockApiClient).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it('does not create an API client for protocol-relative media URLs', () => {
    renderHook(() => useGetImageBlob('//example.com/uploads/photo.png'), {
      wrapper: createWrapper(),
    });

    expect(mockApiClient).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it('does not create an API client for scheme or backslash media paths', () => {
    renderHook(() => useGetImageBlob('javascript:alert(1)'), {
      wrapper: createWrapper(),
    });
    renderHook(() => useGetImageBlob('/uploads\\evil.png'), {
      wrapper: createWrapper(),
    });

    expect(mockApiClient).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });
});
