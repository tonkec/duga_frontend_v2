import { useQuery } from '@tanstack/react-query';
import { getLatestUploads } from '@app/api/uploads';
import { getCookie } from '@app/api';

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
    queryFn: async () => {
      const token = getCookie('token');
      const res = await fetch(secureUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch image blob');
      }

      return await res.blob();
    },
  });

  return { data, error, isLoading };
};
