import { apiClient } from '.';
import { getAllUsers } from './users';

jest.mock('.', () => ({
  apiClient: jest.fn(),
}));

const get = jest.fn();
const mockApiClient = jest.mocked(apiClient);

describe('getAllUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.mockReturnValue({ get } as unknown as ReturnType<typeof apiClient>);
  });

  it('requests users with default pagination', async () => {
    get.mockResolvedValue({ data: [] });

    await getAllUsers();

    expect(get).toHaveBeenCalledWith('/users/get-users/', {
      params: { page: 1, limit: 100 },
    });
  });

  it('normalizes nested paginated users and snake_case verification fields', async () => {
    get.mockResolvedValue({
      data: {
        data: {
          users: [
            {
              id: 2,
              username: 'verified_user',
              is_verified: true,
            },
          ],
          pagination: { page: 1, limit: 100, total: 1 },
        },
      },
    });

    const response = await getAllUsers();

    expect(response.data).toEqual([
      expect.objectContaining({
        id: 2,
        username: 'verified_user',
        isVerified: true,
      }),
    ]);
  });

  it('keeps users visible when the backend omits verification fields', async () => {
    get.mockResolvedValue({
      data: [
        {
          id: 48,
          publicId: '757d9fc7-efa7-4fdd-b05c-1afb2c73f419',
          username: 'lakotako',
          avatar: 'http://placekitten.com/200/300',
          status: 'offline',
        },
      ],
    });

    const response = await getAllUsers();

    expect(response.data).toEqual([
      expect.objectContaining({
        id: 48,
        username: 'lakotako',
        isVerified: true,
      }),
    ]);
  });

  it('preserves explicit unverified users as hidden', async () => {
    get.mockResolvedValue({
      data: [
        {
          id: 49,
          username: 'unverified_user',
          isVerified: false,
        },
      ],
    });

    const response = await getAllUsers();

    expect(response.data).toEqual([
      expect.objectContaining({
        id: 49,
        username: 'unverified_user',
        isVerified: false,
      }),
    ]);
  });
});
