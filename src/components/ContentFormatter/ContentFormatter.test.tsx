import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ContentFormatter from '.';

jest.mock('@app/components/LatestUploads/hooks', () => ({
  useGetImageBlob: () => ({
    data: null,
  }),
}));

jest.mock('@app/components/Image', () => ({
  __esModule: true,
  default: ({
    alt,
    loading,
    referrerPolicy,
    src,
  }: {
    alt: string;
    loading?: boolean;
    referrerPolicy?: React.HTMLAttributeReferrerPolicy;
    src: string;
  }) => (
    <img
      src={src}
      alt={alt}
      loading={loading ? 'lazy' : undefined}
      referrerPolicy={referrerPolicy}
    />
  ),
}));

describe('ContentFormatter media rendering', () => {
  it('renders allowed remote images with privacy attributes', () => {
    render(
      <MemoryRouter>
        <ContentFormatter text="https://m.media-amazon.com/images/M/test.jpg" />
      </MemoryRouter>
    );

    const image = screen.getByAltText('content');

    expect(image).toHaveAttribute('src', 'https://m.media-amazon.com/images/M/test.jpg');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('referrerpolicy', 'no-referrer');
  });

  it('does not render untrusted remote image URLs as images', () => {
    render(
      <MemoryRouter>
        <ContentFormatter text="https://example.com/tracker.png" />
      </MemoryRouter>
    );

    expect(screen.queryByAltText('content')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'https://example.com/tracker.png' })).toHaveAttribute(
      'referrerpolicy',
      'no-referrer'
    );
  });

  it('renders YouTube embeds with sandbox and no referrer', () => {
    render(
      <MemoryRouter>
        <ContentFormatter text="https://www.youtube.com/watch?v=abc123DEF45" />
      </MemoryRouter>
    );

    const iframe = screen.getByTitle('YouTube video');

    expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/abc123DEF45');
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    expect(iframe).toHaveAttribute('referrerpolicy', 'no-referrer');
    expect(iframe).toHaveAttribute('loading', 'lazy');
    expect(iframe).toHaveAttribute('allow', 'encrypted-media; picture-in-picture');
  });
});
