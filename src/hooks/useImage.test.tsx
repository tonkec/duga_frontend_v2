import { act, renderHook, waitFor } from '@testing-library/react';
import useImage from './useImage';

describe('useImage', () => {
  const originalImage = globalThis.Image;
  const imageInstances: Array<{ referrerPolicy: string; src: string; onload?: () => void }> = [];

  beforeEach(() => {
    imageInstances.length = 0;

    class MockImage {
      referrerPolicy = '';
      src = '';
      onload?: () => void;
      onerror?: () => void;

      constructor() {
        imageInstances.push(this);
      }
    }

    Object.defineProperty(globalThis, 'Image', {
      configurable: true,
      value: MockImage,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'Image', {
      configurable: true,
      value: originalImage,
    });
  });

  it('sets no-referrer before assigning image src by default', async () => {
    const { result } = renderHook(() => useImage('https://example.com/photo.jpg'));

    await waitFor(() => expect(imageInstances).toHaveLength(1));

    expect(imageInstances[0].referrerPolicy).toBe('no-referrer');
    expect(imageInstances[0].src).toBe('https://example.com/photo.jpg');

    act(() => {
      imageInstances[0].onload?.();
    });
    await waitFor(() => expect(result.current).toBe(false));
  });

  it('uses the caller-provided referrer policy before assigning image src', async () => {
    renderHook(() => useImage('https://example.com/photo.jpg', 'origin'));

    await waitFor(() => expect(imageInstances).toHaveLength(1));

    expect(imageInstances[0].referrerPolicy).toBe('origin');
    expect(imageInstances[0].src).toBe('https://example.com/photo.jpg');
  });
});
