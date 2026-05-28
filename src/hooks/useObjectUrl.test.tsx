import { renderHook, waitFor } from '@testing-library/react';
import { useObjectUrl, useObjectUrls } from './useObjectUrl';

describe('useObjectUrl', () => {
  const createObjectURL = jest.fn((source: Blob) => `blob:${source.size}`);
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
    const firstBlob = new Blob(['first'], { type: 'image/png' });
    const secondBlob = new Blob(['second'], { type: 'image/jpeg' });
    const { rerender, result } = renderHook(({ source }) => useObjectUrl(source), {
      initialProps: { source: firstBlob },
    });

    await waitFor(() => expect(result.current).toBe('blob:5'));

    rerender({ source: secondBlob });

    await waitFor(() => expect(result.current).toBe('blob:6'));
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:5');
  });

  it('revokes all object URLs on unmount', async () => {
    const blobs = [
      new Blob(['first'], { type: 'image/png' }),
      new Blob(['second'], { type: 'image/webp' }),
    ];
    const { unmount, result } = renderHook(() => useObjectUrls(blobs));

    await waitFor(() => expect(result.current).toEqual(['blob:5', 'blob:6']));

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:5');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:6');
  });

  it('does not create object URLs for SVG or non-image blobs', async () => {
    const svgBlob = new Blob(['<svg />'], { type: 'image/svg+xml' });
    const { result } = renderHook(() => useObjectUrl(svgBlob));

    await waitFor(() => expect(result.current).toBe(''));
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});
