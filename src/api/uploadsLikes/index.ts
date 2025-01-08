import { apiClient } from '..';

interface IAddLikeProps {
  userId: string;
  uploadId: string;
}

export const addUploadLike = async ({ userId, uploadId }: IAddLikeProps) => {
  const client = apiClient();
  return client.post(`/likes/upvote`, {
    userId,
    uploadId,
  });
};

export const removeUploadLike = async ({ userId, uploadId }: IAddLikeProps) => {
  const client = apiClient();
  return client.post(`/likes/downvote`, {
    userId,
    uploadId,
  });
};

export const getUploadLikes = async (uploadId: string) => {
  const client = apiClient();
  return client.get(`/likes/all-likes/${uploadId}`);
};
