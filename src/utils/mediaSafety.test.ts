import {
  getSafeBackendMediaPath,
  getSafeGiphyEmbedUrl,
  getSafeRemoteImageUrl,
  getSafeS3BackendMediaPath,
  getSafeYouTubeEmbedUrl,
  isAllowedRasterImageMimeType,
} from './mediaSafety';

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
    expect(
      getSafeRemoteImageUrl(
        'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/54/photo.png'
      )
    ).toBe('');
  });

  it('normalizes relative backend media paths', () => {
    expect(getSafeBackendMediaPath('uploads/profile-image.png')).toBe('/uploads/profile-image.png');
    expect(getSafeBackendMediaPath('/chat/123/photo.jpg')).toBe('/chat/123/photo.jpg');
  });

  it('rejects absolute, protocol-relative, and non-media backend paths', () => {
    expect(getSafeBackendMediaPath('https://example.com/uploads/photo.jpg')).toBe('');
    expect(getSafeBackendMediaPath('http://example.com/uploads/photo.jpg')).toBe('');
    expect(getSafeBackendMediaPath('//example.com/uploads/photo.jpg')).toBe('');
    expect(getSafeBackendMediaPath('javascript:alert(1)')).toBe('');
    expect(getSafeBackendMediaPath('data:image/png;base64,AAAA')).toBe('');
    expect(getSafeBackendMediaPath('/uploads\\evil.png')).toBe('');
    expect(getSafeBackendMediaPath('/users/1')).toBe('');
  });

  it('converts trusted private S3 image URLs to backend media paths', () => {
    expect(
      getSafeS3BackendMediaPath(
        'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/54/photo.png'
      )
    ).toBe('/uploads/files/development/user/54/photo.png');
  });

  it('converts trusted private S3 object keys to backend media paths', () => {
    expect(getSafeS3BackendMediaPath('development/user/54/photo.png')).toBe(
      '/uploads/files/development/user/54/photo.png'
    );
  });

  it('rejects untrusted S3 backend media paths', () => {
    expect(getSafeS3BackendMediaPath('https://example.com/development/user/54/photo.png')).toBe('');
    expect(
      getSafeS3BackendMediaPath(
        'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/../secret.png'
      )
    ).toBe('');
    expect(
      getSafeS3BackendMediaPath(
        'http://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/54/photo.png'
      )
    ).toBe('');
  });

  it('allows only raster image content types', () => {
    expect(isAllowedRasterImageMimeType('image/png')).toBe(true);
    expect(isAllowedRasterImageMimeType('image/jpeg; charset=binary')).toBe(true);
    expect(isAllowedRasterImageMimeType('image/svg+xml')).toBe(false);
    expect(isAllowedRasterImageMimeType('text/html')).toBe(false);
    expect(isAllowedRasterImageMimeType(undefined)).toBe(false);
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
