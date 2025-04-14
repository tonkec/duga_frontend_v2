import { apiClient } from '..';

export const addUploadComment = async (formData: FormData) => {
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  const client = apiClient();
  return client.post(`/comments/add-comment`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getUploadComments = async (uploadId: string) => {
  const client = apiClient();
  return client.get(`/comments/get-comments/${uploadId}`);
};

export const deleteUploadComment = async (commentId: number) => {
  const client = apiClient();
  return client.delete(`/comments/delete-comment/${commentId}`);
};

export const editUploadComment = async (
  commentId: number,
  comment: string,
  taggedUserIds: number[]
) => {
  const client = apiClient();
  return client.put(`/comments/update-comment/${commentId}`, {
    comment,
    taggedUserIds,
  });
};

export const getLatestUploadComments = async () => {
  const client = apiClient();
  return client.get(`/comments/latest`);
};
