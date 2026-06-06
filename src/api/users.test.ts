import { apiClient } from '.';
import { getAllUsers, getUserById } from './users';

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

describe('getUserById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.mockReturnValue({ get } as unknown as ReturnType<typeof apiClient>);
  });

  it('requests a shared public profile identifier', async () => {
    get.mockResolvedValue({
      data: {
        id: 48,
        publicId: 'd821efd0-1b6a-468b-b61d-7634836f45d6',
        username: 'lakotako',
      },
    });

    const response = await getUserById('d821efd0-1b6a-468b-b61d-7634836f45d6');

    expect(get).toHaveBeenCalledWith('/users/d821efd0-1b6a-468b-b61d-7634836f45d6', {
      skipGlobalErrorHandler: true,
    });
    expect(response.data).toEqual(
      expect.objectContaining({
        id: 48,
        publicId: 'd821efd0-1b6a-468b-b61d-7634836f45d6',
        username: 'lakotako',
        isVerified: true,
      })
    );
  });

  it('unwraps nested single-user API responses', async () => {
    get.mockResolvedValue({
      data: {
        data: {
          id: 49,
          publicId: 'nested-public-id',
          username: 'nested_user',
          is_verified: true,
        },
      },
    });

    const response = await getUserById('nested-public-id');

    expect(response.data).toEqual(
      expect.objectContaining({
        id: 49,
        publicId: 'nested-public-id',
        username: 'nested_user',
        isVerified: true,
      })
    );
  });

  it('merges nested profile fields for shared profile pages', async () => {
    get.mockResolvedValue({
      data: {
        id: 50,
        publicId: 'shared-public-id',
        username: 'jazovski',
        profile: {
          bio: 'Shared profile bio',
          location: 'Zagreb',
          gender: 'Nebinarna osoba',
          sexuality: 'Queer',
          looking_for: 'friendship',
          relationship_status: 'single',
          favorite_day: 'friday',
          makes_my_day: 'Coffee and good tests.',
          sports: true,
        },
      },
    });

    const response = await getUserById('shared-public-id');

    expect(response.data).toEqual(
      expect.objectContaining({
        id: 50,
        publicId: 'shared-public-id',
        username: 'jazovski',
        bio: 'Shared profile bio',
        location: 'Zagreb',
        gender: 'Nebinarna osoba',
        sexuality: 'Queer',
        lookingFor: 'friendship',
        relationshipStatus: 'single',
        favoriteDayOfWeek: 'friday',
        makesMyDay: 'Coffee and good tests.',
        sport: true,
      })
    );
  });
});
