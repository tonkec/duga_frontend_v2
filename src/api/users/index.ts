import { apiClient } from '..';

export interface IUserUpdateProps {
  bio: string;
  sexuality: string;
  gender: string;
  location: string;
  age: number;
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

export const getUserById = async (id: string) => {
  const client = apiClient();
  return client.get(`/users/${id}`);
};

export const updateUser = async (data: IUserUpdateProps) => {
  const client = apiClient();
  return client.post(`/users/update-user`, { data: data });
};
