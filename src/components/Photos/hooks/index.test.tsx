import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { deleteImage } from '@app/api/uploads';
import { useDeletePhoto } from '.';

jest.mock('@app/api/uploads', () => ({
  deleteImage: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockDeleteImage = jest.mocked(deleteImage);

const createWrapper = (queryClient: QueryClient) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return wrapper;
};

describe('useDeletePhoto', () => {
  it('invalidates only the requested list query after deleting a photo', async () => {
    mockDeleteImage.mockResolvedValue({} as Awaited<ReturnType<typeof deleteImage>>);
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeletePhoto(['uploads']), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.deletePhoto({ url: 'development/user/54/photo.png' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDeleteImage).toHaveBeenCalledWith('development/user/54/photo.png');
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['uploads'],
      exact: true,
    });
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: ['uploads', 'photo', 42],
    });
  });
});
