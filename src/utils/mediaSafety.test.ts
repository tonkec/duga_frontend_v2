import { getSafeGiphyEmbedUrl, getSafeRemoteImageUrl, getSafeYouTubeEmbedUrl } from './mediaSafety';

describe('mediaSafety', () => {
  it('allows known remote image hosts over HTTPS', () => {
    expect(getSafeRemoteImageUrl('https://media.giphy.com/media/example/giphy.gif')).toBe(
      'https://media.giphy.com/media/example/giphy.gif'
    );
    expect(getSafeRemoteImageUrl('https://m.media-amazon.com/images/M/test.jpg')).toBe(
      'https://m.media-amazon.com/images/M/test.jpg'
    );
  });

  it('rejects untrusted or non-HTTPS remote image URLs', () => {
    expect(getSafeRemoteImageUrl('https://example.com/tracker.png')).toBe('');
    expect(getSafeRemoteImageUrl('http://media.giphy.com/media/example/giphy.gif')).toBe('');
  });

  it('builds restricted embed URLs only for valid IDs', () => {
    expect(getSafeYouTubeEmbedUrl('abc123DEF45')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123DEF45'
    );
    expect(getSafeYouTubeEmbedUrl('bad/id')).toBe('');
    expect(getSafeGiphyEmbedUrl('safe-giphy_id')).toBe('https://giphy.com/embed/safe-giphy_id');
    expect(getSafeGiphyEmbedUrl('bad/id')).toBe('');
  });
});
