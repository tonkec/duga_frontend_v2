import { useQuery } from '@tanstack/react-query';
import { getLatestUploads } from '@app/api/uploads';

export const useGetLatestUploads = () => {
  const {
    data: latestUploads,
    error: latestUploadsError,
    isPending: isLatestUploadsLoading,
  } = useQuery({
    queryKey: ['latestUploads'],
    queryFn: () => getLatestUploads(),
  });

  return { latestUploads, latestUploadsError, isLatestUploadsLoading };
};
