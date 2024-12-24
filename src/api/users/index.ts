import { apiClient } from '..';

export const getAllUsers = async () => {
  const client = apiClient({ isAuth: false });
  return client.get(`/users/get-users/`);
};

export const getUserById = async (id: string) => {
  const client = apiClient({ isAuth: false });
  return client.get(`/users/${id}`);
};
