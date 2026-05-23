import { useQuery } from '@tanstack/react-query';
import { getLatestUploads } from '@app/api/uploads';
import { apiClient } from '@app/api';
import axios from 'axios';

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
    retry: false,
    queryFn: async () => {
      if (!secureUrl) throw new Error('Missing secure URL');

      const client = apiClient();

      try {
        const response = await client.get(secureUrl, {
          responseType: 'blob',
          skipGlobalErrorHandler: true,
        });

        return response.data as Blob;
      } catch (error) {
        if (axios.isAxiosError(error) && [401, 403, 404].includes(error.response?.status || 0)) {
          return null;
        }

        throw error;
      }
    },
  });

  return { data, error, isLoading };
};
