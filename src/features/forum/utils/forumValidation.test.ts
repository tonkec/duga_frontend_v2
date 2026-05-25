import {
  FORUM_MAX_IMAGE_COUNT,
  FORUM_MAX_IMAGE_SIZE_BYTES,
  validateForumImages,
} from './forumValidation';

const createFile = (name: string, size: number, type = 'image/png') =>
  new File([new Uint8Array(size)], name, { type });

describe('forumValidation', () => {
  it('allows valid image files', () => {
    const images = [
      createFile('first.png', FORUM_MAX_IMAGE_SIZE_BYTES),
      createFile('second.jpg', 128, 'image/jpeg'),
    ];

    expect(validateForumImages(images)).toBe('');
  });

  it('rejects more than five images', () => {
    const images = Array.from({ length: FORUM_MAX_IMAGE_COUNT + 1 }, (_, index) =>
      createFile(`image-${index}.png`, 128)
    );

    expect(validateForumImages(images)).toBe('Možeš dodati najviše 5 slika.');
  });

  it('counts existing images when validating selected files', () => {
    const images = [
      createFile('third.png', 128),
      createFile('fourth.png', 128),
      createFile('fifth.png', 128),
      createFile('sixth.png', 128),
    ];

    expect(validateForumImages(images, 2)).toBe(
      'Ukupno možeš imati najviše 5 slika. Trenutno imaš 2, možeš dodati još 3.'
    );
  });

  it('rejects non-image files', () => {
    expect(validateForumImages([createFile('document.pdf', 128, 'application/pdf')])).toBe(
      'Možeš dodati samo slikovne datoteke.'
    );
  });

  it('rejects images larger than one megabyte', () => {
    expect(validateForumImages([createFile('large.png', FORUM_MAX_IMAGE_SIZE_BYTES + 1)])).toBe(
      'Svaka slika može imati najviše 1 MB.'
    );
  });
});
