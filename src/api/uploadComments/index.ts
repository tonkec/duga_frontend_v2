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
