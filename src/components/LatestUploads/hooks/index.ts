import { useQuery } from '@tanstack/react-query';
import { getLatestUploads } from '@app/api/uploads';
import { apiClient } from '@app/api';

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

export const useGetImageBlob = (secureUrl: string) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['imageBlob', secureUrl],
    enabled: !!secureUrl,
    retry: 1,
    queryFn: async () => {
      if (!secureUrl) throw new Error('Missing secure URL');

      const client = apiClient();

      const response = await client.get(secureUrl, {
        responseType: 'blob',
      });

      return response.data as Blob;
    },
  });

  return { data, error, isLoading };
};
