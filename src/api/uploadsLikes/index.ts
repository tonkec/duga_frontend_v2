import { apiClient } from '..';

interface IAddLikeProps {
  uploadId: string;
}

export const addUploadLike = async ({ uploadId }: IAddLikeProps) => {
  const client = apiClient();
  return client.post(`/likes/upvote/${uploadId}`);
};

export const removeUploadLike = async ({ uploadId }: IAddLikeProps) => {
  const client = apiClient();
  return client.post(`/likes/downvote/${uploadId}`);
};

export const getUploadLikes = async (uploadId: string) => {
  const client = apiClient();
  return client.get(`/likes/all-likes/${uploadId}`);
};
