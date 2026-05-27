import { apiClient } from '.';
import { deleteImage, getDeletePhotoUrl } from './uploads';

jest.mock('.', () => ({
  apiClient: jest.fn(),
}));

const deleteRequest = jest.fn();
const mockApiClient = jest.mocked(apiClient);

describe('uploads API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.mockReturnValue({
      delete: deleteRequest,
    } as unknown as ReturnType<typeof apiClient>);
  });

  it('normalizes full Duga S3 URLs to object keys for delete requests', () => {
    expect(
      getDeletePhotoUrl(
        'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/54/photo.png'
      )
    ).toBe('development/user/54/photo.png');
  });

  it('normalizes backend file proxy paths to object keys for delete requests', () => {
    expect(getDeletePhotoUrl('/uploads/files/development/user/54/photo.png')).toBe(
      'development/user/54/photo.png'
    );
  });

  it('sends delete-photo body with the image object key', async () => {
    deleteRequest.mockResolvedValue({ data: {} });

    await deleteImage(
      'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/54/photo.png'
    );

    expect(deleteRequest).toHaveBeenCalledWith('/uploads/delete-photo', {
      data: {
        url: 'development/user/54/photo.png',
      },
      skipGlobalErrorHandler: true,
    });
  });
});
