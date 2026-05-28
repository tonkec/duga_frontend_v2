import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import { useObjectUrl } from '@app/hooks/useObjectUrl';
import Photo from '.';
import { IImage } from '../..';

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

describe('Photo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetImageBlob.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
    } as ReturnType<typeof useGetImageBlob>);
    mockUseObjectUrl.mockReturnValue('');
  });

  it('renders blob URLs for private S3 photos', () => {
    const imageBlob = new Blob(['image'], { type: 'image/png' });
    mockUseGetImageBlob.mockReturnValue({
      data: imageBlob,
      error: null,
      isLoading: false,
    } as ReturnType<typeof useGetImageBlob>);
    mockUseObjectUrl.mockReturnValue('blob:http://localhost/photo');

    render(
      <Photo
        image={createImage({
          securePhotoUrl:
            'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/54/photo.png',
        })}
      />
    );

    expect(screen.getByRole('img', { name: 'fotografija' })).toHaveAttribute(
      'src',
      'blob:http://localhost/photo'
    );
  });

  it('tries fallback image fields when the first private source has no blob', () => {
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
    mockUseObjectUrl.mockReturnValue('blob:http://localhost/fallback-photo');

    render(
      <Photo
        image={createImage({
          securePhotoUrl:
            'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/54/missing.png',
          url: 'development/user/54/1779482229142/antonijasimic.png',
        })}
      />
    );

    expect(mockUseGetImageBlob).toHaveBeenNthCalledWith(
      1,
      'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/54/missing.png'
    );
    expect(mockUseGetImageBlob).toHaveBeenNthCalledWith(
      2,
      'development/user/54/1779482229142/antonijasimic.png'
    );
    expect(screen.getByRole('img', { name: 'fotografija' })).toHaveAttribute(
      'src',
      'blob:http://localhost/fallback-photo'
    );
  });

  it('does not fall back to raw private S3 URLs when the blob is unavailable', () => {
    render(
      <Photo
        image={createImage({
          securePhotoUrl:
            'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/54/photo.png',
        })}
      />
    );

    expect(screen.queryByRole('img', { name: 'fotografija' })).not.toBeInTheDocument();
    expect(screen.getByText('Fotografija se nije učitala')).toBeVisible();
  });

  it('does not render an empty image src when no safe source is available', () => {
    render(<Photo image={createImage({ url: '' })} />);

    expect(screen.queryByRole('img', { name: 'fotografija' })).not.toBeInTheDocument();
    expect(screen.getByText('Fotografija se nije učitala')).toBeVisible();
  });
});
