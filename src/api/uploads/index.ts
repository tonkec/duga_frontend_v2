import { apiClient } from '..';

export const getAllImages = async (id: string) => {
  const client = apiClient();
  return client.get(`/uploads/user/${id}`);
};

export const deleteImage = async (photoId: number | string) => {
  const client = apiClient();
  return client.delete(`/uploads/photo/${photoId}`);
};

export const getSingleImage = async (id: string) => {
  const client = apiClient();
  return client.get(`/uploads/photo/${id}`);
};

export const uploadPhotos = async (data: FormData) => {
  const client = apiClient();
  return client.post(`/uploads/photos`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getLatestUploads = async () => {
  const client = apiClient();
  return client.get(`/uploads/latest`);
};

export const uploadMessagePhotos = async (data: FormData) => {
  const client = apiClient();
  return client.post(`/uploads/message-photos`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getProfilePhoto = async (userId: string) => {
  const client = apiClient();
  return client.get(`/uploads/profile-photo/${userId}`, {
    skipGlobalErrorHandler: true,
  });
};
