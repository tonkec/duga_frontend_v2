import { apiClient } from '..';

export const getAllImages = async (id: string) => {
  const client = apiClient({ isAuth: false });
  return client.get(`/uploads/avatar/${id}`);
};
