import { apiClient } from '..';

export const getAllUsers = async () => {
  const client = apiClient({ isAuth: false });
  return client.get(`/users/get-users/`);
};
