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
};

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
  return client.get(`/users/${id}`, {
    skipGlobalErrorHandler: true,
  });
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
