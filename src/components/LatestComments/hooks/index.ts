import { useQuery } from '@tanstack/react-query';
import { getLatestUploadComments } from '../../../api/uploadsComments';

export const useGetLatestComments = () => {
  const {
    data: allComments,
    error: allCommentsError,
    isPending: isAllCommentsLoading,
  } = useQuery({
    queryKey: ['comments'],
    queryFn: getLatestUploadComments,
  });

  return { allComments, allCommentsError, isAllCommentsLoading };
};
