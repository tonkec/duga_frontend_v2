import { renderHook, waitFor } from '@testing-library/react';
import { useObjectUrl, useObjectUrls } from './useObjectUrl';

describe('useObjectUrl', () => {
  const createObjectURL = jest.fn((source: Blob | MediaSource) =>
    source instanceof Blob ? `blob:${source.size}` : 'blob:media-source'
  );
  const revokeObjectURL = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    });
  });

  it('revokes the previous object URL when the source changes', async () => {
    const firstBlob = new Blob(['first']);
    const secondBlob = new Blob(['second']);
    const { rerender, result } = renderHook(({ source }) => useObjectUrl(source), {
      initialProps: { source: firstBlob },
    });

    await waitFor(() => expect(result.current).toBe('blob:5'));

    rerender({ source: secondBlob });

    await waitFor(() => expect(result.current).toBe('blob:6'));
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:5');
  });

  it('revokes all object URLs on unmount', async () => {
    const blobs = [new Blob(['first']), new Blob(['second'])];
    const { unmount, result } = renderHook(() => useObjectUrls(blobs));

    await waitFor(() => expect(result.current).toEqual(['blob:5', 'blob:6']));

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:5');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:6');
  });
});
