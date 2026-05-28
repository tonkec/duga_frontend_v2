import { getYouTubeEmbedUrl, isYouTubeUrl } from './youtube';

describe('YouTube URL utilities', () => {
  it('normalizes supported YouTube links to embed URLs', () => {
    expect(getYouTubeEmbedUrl('https://www.youtube.com/watch?v=59Q_lhgGANc')).toBe(
      'https://www.youtube-nocookie.com/embed/59Q_lhgGANc'
    );
    expect(getYouTubeEmbedUrl('https://youtu.be/59Q_lhgGANc')).toBe(
      'https://www.youtube-nocookie.com/embed/59Q_lhgGANc'
    );
    expect(getYouTubeEmbedUrl('https://www.youtube.com/embed/59Q_lhgGANc')).toBe(
      'https://www.youtube-nocookie.com/embed/59Q_lhgGANc'
    );
  });

  it('rejects non-YouTube values', () => {
    expect(isYouTubeUrl('https://vimeo.com/123')).toBe(false);
    expect(getYouTubeEmbedUrl('not-a-youtube-url')).toBeNull();
  });
});
