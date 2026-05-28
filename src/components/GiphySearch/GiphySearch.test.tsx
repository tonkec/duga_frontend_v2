import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import GiphySearch from '.';
import { useGIFS } from './hooks';

jest.mock('./hooks', () => ({
  useGIFS: jest.fn(),
}));

jest.mock('@app/components/Image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

const mockUseGIFS = jest.mocked(useGIFS);

describe('GiphySearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('only renders and selects GIF URLs allowed by mediaSafety', () => {
    const onGifSelect = jest.fn();
    const onClose = jest.fn();

    mockUseGIFS.mockReturnValue({
      allGIFS: [
        {
          id: 'safe',
          title: 'Safe GIF',
          images: {
            fixed_height: { url: 'https://media.giphy.com/media/safe/giphy.gif' },
            original: { url: 'https://media.giphy.com/media/safe/giphy.gif' },
          },
        },
        {
          id: 'unsafe-preview',
          title: 'Unsafe Preview GIF',
          images: {
            fixed_height: { url: 'https://example.com/unsafe.gif' },
            original: { url: 'https://example.com/unsafe.gif' },
          },
        },
        {
          id: 'unsafe-original',
          title: 'Unsafe Original GIF',
          images: {
            fixed_height: { url: 'https://media.giphy.com/media/preview/giphy.gif' },
            original: { url: 'https://evil.example/unsafe.gif' },
          },
        },
      ],
      gifsError: null,
      isGIFSLoading: false,
    } as ReturnType<typeof useGIFS>);

    render(<GiphySearch isOpen onGifSelect={onGifSelect} onClose={onClose} />);

    expect(screen.getByAltText('Safe GIF')).toBeVisible();
    expect(screen.queryByAltText('Unsafe Preview GIF')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Unsafe Original GIF')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /safe gif/i }));

    expect(onGifSelect).toHaveBeenCalledWith('https://media.giphy.com/media/safe/giphy.gif');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
