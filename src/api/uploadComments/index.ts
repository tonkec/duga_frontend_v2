import { apiClient } from '..';

interface IAddCommentProps {
  userId: string;
  uploadId: string;
  comment: string;
}

export const addUploadComment = async ({ userId, uploadId, comment }: IAddCommentProps) => {
  const client = apiClient();
  return client.post(`/comments/add-comment`, {
    userId,
    uploadId,
    comment,
  });
};

export const getUploadComments = async (uploadId: string) => {
  const client = apiClient();
  return client.get(`/comments/get-comments/${uploadId}`);
};

export const deleteUploadComment = async (commentId: string) => {
  const client = apiClient();
  return client.delete(`/comments/delete-comment/${commentId}`);
};

export const updateUploadComment = async (commentId: string, comment: string) => {
  const client = apiClient();
  return client.put(`/comments/update-comment/${commentId}`, {
    comment,
  });
};
