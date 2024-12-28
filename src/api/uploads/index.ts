import { apiClient } from '..';

export const getAllImages = async (id: string) => {
  const client = apiClient({ isAuth: false });
  return client.get(`/uploads/avatar/${id}`);
};

export const deleteImage = async (url: string) => {
  const client = apiClient({ isAuth: false });
  return client.delete(`/uploads/delete-photo`, { data: { url } });
};
