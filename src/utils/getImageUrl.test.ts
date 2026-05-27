import { IImage } from '@app/components/Photos';
import { getImageUrl } from './getImageUrl';

const createImage = (overrides: Partial<IImage>): IImage =>
  ({
    createdAt: '',
    description: '',
    fileType: 'image',
    id: 1,
    isProfilePhoto: false,
    name: 'photo',
    securePhotoUrl: '',
    updatedAt: '',
    url: '',
    userId: '1',
    ...overrides,
  }) as IImage;

describe('getImageUrl', () => {
  it('returns allowed absolute image URLs as-is', () => {
    const imageUrl = 'https://m.media-amazon.com/images/M/photo.png';

    expect(getImageUrl(createImage({ url: imageUrl }))).toBe(imageUrl);
  });

  it('does not build direct S3 URLs from stored image keys', () => {
    expect(getImageUrl(createImage({ url: 'uploads/photo.png' }))).toBe('');
  });

  it('does not return direct Duga S3 URLs', () => {
    expect(
      getImageUrl(
        createImage({
          imageUrl:
            'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/54/photo.png',
        })
      )
    ).toBe('');
  });

  it('rejects unsafe absolute URLs', () => {
    expect(getImageUrl(createImage({ url: 'http://example.com/photo.png' }))).toBe('');
  });
});
