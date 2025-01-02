import { apiClient } from '..';

export const getAllImages = async (id: string) => {
  const client = apiClient();
  return client.get(`/uploads/avatar/${id}`);
};

export const deleteImage = async (url: string) => {
  const client = apiClient();
  return client.delete(`/uploads/delete-photo`, { data: { url } });
};

export const uploadPhotos = async (data: FormData) => {
  const client = apiClient();
  return client.post(`/uploads/photos`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
