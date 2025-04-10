import { apiClient } from '..';

interface IAddCommentProps {
  userId: string;
  uploadId: string;
  comment: string;
  photos: File[];
}

export const addUploadComment = async ({ userId, uploadId, comment, photos }: IAddCommentProps) => {
  const client = apiClient();
  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('uploadId', uploadId);
  formData.append('comment', comment);
  if (photos && photos.length > 0) {
    for (let i = 0; i < photos.length; i++) {
      formData.append('photos', photos[i]);
    }
  }

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

export const editUploadComment = async (commentId: number, comment: string) => {
  const client = apiClient();
  return client.put(`/comments/update-comment/${commentId}`, {
    comment,
  });
};

export const getLatestUploadComments = async () => {
  const client = apiClient();
  return client.get(`/comments/latest`);
};
