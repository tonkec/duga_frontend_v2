import { useQuery } from '@tanstack/react-query';
import { getLatestUploads } from '@app/api/uploads';
import { apiClient } from '@app/api';
import axios from 'axios';
import { getSafeBackendMediaPath, isAllowedRasterImageMimeType } from '@app/utils/mediaSafety';

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
  const safeMediaPath = getSafeBackendMediaPath(secureUrl);
  const { data, error, isLoading } = useQuery({
    queryKey: ['imageBlob', safeMediaPath],
    enabled: !!safeMediaPath,
    retry: false,
    queryFn: async () => {
      if (!safeMediaPath) return null;

      const client = apiClient();

      try {
        const response = await client.get(safeMediaPath, {
          responseType: 'blob',
          skipGlobalErrorHandler: true,
        });

        const contentType = response.headers?.['content-type'];
        if (!isAllowedRasterImageMimeType(contentType)) {
          return null;
        }

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
