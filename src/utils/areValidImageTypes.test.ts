import { areValidImageTypes } from './areValidImageTypes';

const createFileList = (files: File[]) =>
  Object.assign(files, {
    item: (index: number) => files[index] ?? null,
  }) as unknown as FileList;

describe('areValidImageTypes', () => {
  it('allows raster image types', () => {
    const files = createFileList([
      new File([''], 'photo.png', { type: 'image/png' }),
      new File([''], 'photo.jpg', { type: 'image/jpeg' }),
      new File([''], 'photo.webp', { type: 'image/webp' }),
    ]);

    expect(areValidImageTypes(files)).toBe(true);
  });

  it('rejects SVG files', () => {
    const files = createFileList([new File([''], 'vector.svg', { type: 'image/svg+xml' })]);

    expect(areValidImageTypes(files)).toBe(false);
  });
});
