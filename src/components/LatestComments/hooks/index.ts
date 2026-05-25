import { useQuery } from '@tanstack/react-query';
import { getLatestUploadComments } from '@app/api/uploadsComments';

export const useGetLatestComments = () => {
  const {
    data: allComments,
    error: allCommentsError,
    isPending: isAllCommentsLoading,
  } = useQuery({
    queryKey: ['comments', 'latest'],
    queryFn: getLatestUploadComments,
  });

  return { allComments, allCommentsError, isAllCommentsLoading };
};
