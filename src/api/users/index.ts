import { apiClient } from '..';
import { IUser } from '@app/components/UserCard';

export interface IUserUpdateProps {
  bio: string;
  sexuality: string;
  gender: string;
  location: string;
  age: string;
  lookingFor: string;
  relationshipStatus: string;
  cigarettes?: boolean;
  alcohol?: boolean;
  sport?: boolean;
  favoriteDay: string;
  spirituality: string;
  embarasement: string;
  tooOldFor: string;
  makesMyDay: string;
  favoriteSong: string;
  favoriteMovie: string;
  interests: string;
  languages: string;
  ending: string;
}

export interface IPostLoginProps {
  username: string;
  age: number;
  acceptPrivacy: boolean;
  acceptTerms: boolean;
}

export interface ProfileView {
  id: number;
  viewerId: number;
  viewedUserId: number;
  createdAt: string;
  updatedAt: string;
  viewer: {
    id: number;
    publicId?: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export interface ProfileViewsResponse {
  data: ProfileView[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type UsersResponse =
  | IUser[]
  | {
      data?: IUser[] | { data?: IUser[]; users?: IUser[]; rows?: IUser[]; items?: IUser[] };
      users?: IUser[];
      rows?: IUser[];
      items?: IUser[];
    };

type RawUser = IUser & {
  emailVerified?: boolean;
  email_verified?: boolean;
  is_verified?: boolean;
  verified?: boolean;
  [key: string]: unknown;
};

type SingleUserResponse =
  | RawUser
  | {
      data?: RawUser | { data?: RawUser; user?: RawUser };
      user?: RawUser;
    };

const PUBLIC_PROFILE_ENDPOINTS = ['/users/public', '/users/public-id', '/users/profile'];

const getNormalizedVerification = (user: RawUser) =>
  user.isVerified ??
  user.is_verified ??
  user.emailVerified ??
  user.email_verified ??
  user.verified ??
  true;

const normalizeUser = (user: RawUser): IUser => ({
  ...user,
  isVerified: Boolean(getNormalizedVerification(user)),
});

const getStringField = (record: Record<string, unknown>, keys: string[]) => {
  const value = keys.map((key) => record[key]).find((field) => typeof field === 'string');
  return typeof value === 'string' ? value : undefined;
};

const getBooleanField = (record: Record<string, unknown>, keys: string[]) => {
  const value = keys.map((key) => record[key]).find((field) => typeof field === 'boolean');
  return typeof value === 'boolean' ? value : undefined;
};

const getProfileRecord = (user: RawUser) => {
  const profile = user.profile ?? user.Profile ?? user.userProfile ?? user.UserProfile;
  return profile && typeof profile === 'object' && !Array.isArray(profile)
    ? (profile as Record<string, unknown>)
    : {};
};

const isPublicProfileIdentifier = (value: string) => Boolean(value && !/^\d+$/.test(value));

const normalizeProfileUser = (user: RawUser): RawUser => {
  const profile = getProfileRecord(user);
  const source = { ...profile, ...user } as Record<string, unknown>;

  return {
    ...user,
    bio: getStringField(source, ['bio', 'about', 'description']) ?? user.bio,
    gender: getStringField(source, ['gender']) ?? user.gender,
    sexuality: getStringField(source, ['sexuality']) ?? user.sexuality,
    location: getStringField(source, ['location', 'city']) ?? user.location,
    lookingFor: getStringField(source, ['lookingFor', 'looking_for']) ?? user.lookingFor,
    relationshipStatus:
      getStringField(source, ['relationshipStatus', 'relationship_status']) ??
      user.relationshipStatus,
    favoriteDayOfWeek:
      getStringField(source, [
        'favoriteDayOfWeek',
        'favorite_day_of_week',
        'favoriteDay',
        'favorite_day',
      ]) ?? user.favoriteDayOfWeek,
    spirituality: getStringField(source, ['spirituality']) ?? user.spirituality,
    embarasement: getStringField(source, ['embarasement', 'embarrassment']) ?? user.embarasement,
    tooOldFor: getStringField(source, ['tooOldFor', 'too_old_for']) ?? user.tooOldFor,
    makesMyDay: getStringField(source, ['makesMyDay', 'makes_my_day']) ?? user.makesMyDay,
    favoriteSong: getStringField(source, ['favoriteSong', 'favorite_song']) ?? user.favoriteSong,
    favoriteMovie:
      getStringField(source, ['favoriteMovie', 'favorite_movie']) ?? user.favoriteMovie,
    interests: getStringField(source, ['interests']) ?? user.interests,
    languages: getStringField(source, ['languages']) ?? user.languages,
    ending: getStringField(source, ['ending']) ?? user.ending,
    cigarettes: getBooleanField(source, ['cigarettes']) ?? user.cigarettes,
    alcohol: getBooleanField(source, ['alcohol']) ?? user.alcohol,
    sport: getBooleanField(source, ['sport', 'sports']) ?? user.sport,
  };
};

const getUsersFromResponse = (response: UsersResponse): IUser[] => {
  const users = (() => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && !Array.isArray(response.data)) {
      if (Array.isArray(response.data.data)) return response.data.data;
      if (Array.isArray(response.data.users)) return response.data.users;
      if (Array.isArray(response.data.rows)) return response.data.rows;
      if (Array.isArray(response.data.items)) return response.data.items;
    }
    if (Array.isArray(response.users)) return response.users;
    if (Array.isArray(response.rows)) return response.rows;
    if (Array.isArray(response.items)) return response.items;

    return [];
  })();

  return users.map((user) => normalizeUser(user as RawUser));
};

const getUserFromResponse = (response: SingleUserResponse): IUser | undefined => {
  if (!response || typeof response !== 'object') return undefined;

  const responseData = response as Record<string, unknown>;
  const nestedData = responseData.data;

  if (nestedData && typeof nestedData === 'object' && !Array.isArray(nestedData)) {
    const nestedDataRecord = nestedData as Record<string, unknown>;
    if (nestedDataRecord.data && typeof nestedDataRecord.data === 'object') {
      return normalizeUser(normalizeProfileUser(nestedDataRecord.data as RawUser));
    }

    if (nestedDataRecord.user && typeof nestedDataRecord.user === 'object') {
      return normalizeUser(normalizeProfileUser(nestedDataRecord.user as RawUser));
    }

    return normalizeUser(normalizeProfileUser(nestedData as RawUser));
  }

  if (responseData.user && typeof responseData.user === 'object') {
    return normalizeUser(normalizeProfileUser(responseData.user as RawUser));
  }

  return normalizeUser(normalizeProfileUser(response as RawUser));
};

export const getAllUsers = async ({
  page = 1,
  limit = 100,
}: { page?: number; limit?: number } = {}) => {
  const client = apiClient();
  const response = await client.get<UsersResponse>(`/users/get-users/`, {
    params: { page, limit },
  });

  return {
    ...response,
    data: getUsersFromResponse(response.data),
  };
};

export const getCurrentUser = () => {
  const client = apiClient();
  return client.get(`/users/current-user/`, {
    skipGlobalErrorHandler: true,
  });
};

export const getUserById = async (id: string) => {
  const client = apiClient();
  const endpointCandidates = [
    ...(isPublicProfileIdentifier(id)
      ? PUBLIC_PROFILE_ENDPOINTS.map((endpoint) => `${endpoint}/${id}`)
      : []),
    `/users/${id}`,
  ];
  let response: Awaited<ReturnType<typeof client.get<SingleUserResponse>>> | undefined;

  for (const endpoint of endpointCandidates) {
    try {
      response = await client.get<SingleUserResponse>(endpoint, {
        skipGlobalErrorHandler: true,
      });
      break;
    } catch (error) {
      if (endpoint === endpointCandidates[endpointCandidates.length - 1]) {
        throw error;
      }
    }
  }

  return {
    ...response!,
    data: getUserFromResponse(response!.data),
  };
};

export const getProfileViews = async ({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
}) => {
  const client = apiClient();
  return client.get<ProfileViewsResponse>(`/users/profile-views`, {
    params: { page, limit },
  });
};

export const updateUser = async (data: IUserUpdateProps) => {
  const client = apiClient();
  return client.post(`/users/update-user`, { data: data });
};

export const deleteUser = async () => {
  const client = apiClient();
  return client.delete(`/delete-user`);
};

export const getUserByUsername = async (username: string) => {
  const client = apiClient();
  return client.get(`/users/username/${username}`);
};

export const getUserOnlineStatus = async () => {
  const client = apiClient();
  return client.get(`/users/online-status/`, {
    skipGlobalErrorHandler: true,
  });
};

export const getAllUserPhotos = async () => {
  const client = apiClient();
  return client.get(`/uploads/user-photos/`, {
    skipGlobalErrorHandler: true,
  });
};

export const getUsersByUsernames = async (usernames: string[]) => {
  const client = apiClient();
  return client.post('/users/by-usernames', { usernames });
};

export const updatePostLoginData = async (data: IPostLoginProps) => {
  const client = apiClient();
  return client.post(`/users/post-login`, { data: data });
};
