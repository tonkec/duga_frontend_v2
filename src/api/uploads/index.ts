import { apiClient } from '..';

const DUGA_S3_IMAGE_HOST = 'duga-user-photo.s3.eu-north-1.amazonaws.com';

export const getDeletePhotoUrl = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return '';

  try {
    const url = new URL(trimmedValue);
    if (url.hostname === DUGA_S3_IMAGE_HOST) {
      return url.pathname.replace(/^\/+/, '');
    }
  } catch {
    // Not an absolute URL, treat it as an object key/path below.
  }

  return trimmedValue.replace(/^\/+/, '').replace(/^uploads\/files\//, '');
};

export const getAllImages = async (id: string) => {
  const client = apiClient();
  return client.get(`/uploads/user/${id}`);
};

export const deleteImage = async (url: string) => {
  const client = apiClient();
  return client.delete('/uploads/delete-photo', {
    data: {
      url: getDeletePhotoUrl(url),
    },
    skipGlobalErrorHandler: true,
  });
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
