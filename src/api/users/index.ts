import { apiClient } from '..';

export interface IUserUpdateProps {
  bio: string;
  sexuality: string;
  gender: string;
  location: string;
  age: string;
  username: string;
  lookingFor: string;
  relationshipStatus: string;
  cigarettes: boolean;
  alcohol: boolean;
  sport: boolean;
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
export const getAllUsers = async () => {
  const client = apiClient();
  return client.get(`/users/get-users/`);
};

export const getCurrentUser = () => {
  const client = apiClient();
  return client.get(`/users/current-user/`);
};

export const getUserById = async (id: string) => {
  const client = apiClient();
  return client.get(`/users/${id}`);
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
  return client.get(`/users/online-status/`);
};

export const getAllUserPhotos = async () => {
  const client = apiClient();
  return client.get(`/uploads/user-photos/`);
};
