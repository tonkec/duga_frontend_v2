import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import { useObjectUrl } from '@app/hooks/useObjectUrl';
import BlobImage from '.';

jest.mock('@app/components/LatestUploads/hooks', () => ({
  useGetImageBlob: jest.fn(),
}));

jest.mock('@app/hooks/useObjectUrl', () => ({
  useObjectUrl: jest.fn(),
}));

jest.mock('@app/components/Image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const mockUseGetImageBlob = jest.mocked(useGetImageBlob);
const mockUseObjectUrl = jest.mocked(useObjectUrl);

describe('BlobImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetImageBlob.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
    } as ReturnType<typeof useGetImageBlob>);
    mockUseObjectUrl.mockReturnValue('');
  });

  it('renders the first available blob from fallback image URLs', () => {
    const imageBlob = new Blob(['image'], { type: 'image/png' });
    mockUseGetImageBlob
      .mockReturnValueOnce({
        data: null,
        error: null,
        isLoading: false,
      } as ReturnType<typeof useGetImageBlob>)
      .mockReturnValueOnce({
        data: imageBlob,
        error: null,
        isLoading: false,
      } as ReturnType<typeof useGetImageBlob>)
      .mockReturnValue({
        data: null,
        error: null,
        isLoading: false,
      } as ReturnType<typeof useGetImageBlob>);
    mockUseObjectUrl.mockReturnValue('blob:http://localhost/edit-photo');

    render(
      <BlobImage
        imageUrls={[
          'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/54/missing.png',
          'development/user/54/1779482229142/antonijasimic.png',
        ]}
        name="antonijasimic.png"
      />
    );

    expect(screen.getByRole('img', { name: 'antonijasimic.png' })).toHaveAttribute(
      'src',
      'blob:http://localhost/edit-photo'
    );
  });
});
