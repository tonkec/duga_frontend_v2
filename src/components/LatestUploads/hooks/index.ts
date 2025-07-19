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
    enabled: !!secureUrl,
    retry: 1,
    queryFn: async () => {
      if (!secureUrl) throw new Error('Missing secure URL');
      const token = getCookie('token');
      if (!token) throw new Error('User is not authenticated');

      const res = await fetch(secureUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch image blob: ${res.statusText}`);
      }

      return await res.blob();
    },
  });

  return { data, error, isLoading };
};
