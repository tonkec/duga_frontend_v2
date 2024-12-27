import { apiClient } from '..';

export const getAllUsers = async () => {
  const client = apiClient({ isAuth: false });
  return client.get(`/users/get-users/`);
};

export const getUserById = async (id: string) => {
  const client = apiClient({ isAuth: false });
  return client.get(`/users/${id}`);
};

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
}

export const updateUser = async (data: IUserUpdateProps) => {
  console.log(data);
  const client = apiClient({ isAuth: false });
  return client.post(`/users/update-user`, { data: data });
};
