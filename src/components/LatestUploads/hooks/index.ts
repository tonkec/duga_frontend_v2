import { useQuery } from '@tanstack/react-query';
import { getLatestUploads } from '@app/api/uploads';
import { apiClient } from '@app/api';
import axios from 'axios';
import {
  getSafeBackendMediaPath,
  getSafeRemoteImageUrl,
  getSafeS3BackendMediaPath,
  isAllowedRasterImageMimeType,
} from '@app/utils/mediaSafety';

const getRasterImageMimeTypeFromPath = (value: string) => {
  const pathname = (() => {
    try {
      return new URL(value, window.location.origin).pathname;
    } catch {
      return value.split('?')[0];
    }
  })().toLowerCase();

  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.webp')) return 'image/webp';
  return '';
};

const isGenericBinaryMimeType = (value: string | undefined) => {
  const normalizedValue = value?.split(';')[0]?.trim().toLowerCase();
  return !normalizedValue || normalizedValue === 'application/octet-stream';
};

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
  const safeMediaPath = getSafeBackendMediaPath(secureUrl) || getSafeS3BackendMediaPath(secureUrl);
  const safeRemoteImageUrl = getSafeRemoteImageUrl(secureUrl);
  const safeImageSource = safeMediaPath || safeRemoteImageUrl;
  const { data, error, isLoading } = useQuery({
    queryKey: ['imageBlob', safeImageSource],
    enabled: !!safeImageSource,
    retry: false,
    queryFn: async () => {
      if (!safeImageSource) return null;

      const getImage = () => {
        if (safeMediaPath) {
          const client = apiClient();
          return client.get(safeMediaPath, {
            responseType: 'blob',
            skipGlobalErrorHandler: true,
          });
        }

        return axios.get(safeRemoteImageUrl, {
          responseType: 'blob',
        });
      };

      try {
        const response = await getImage();

        const imageBlob = response.data as Blob;
        const contentTypeHeader = response.headers?.['content-type'];
        const headerContentType =
          typeof contentTypeHeader === 'string' ? contentTypeHeader : undefined;
        const blobContentType = imageBlob.type || undefined;
        if (
          (!isGenericBinaryMimeType(headerContentType) &&
            !isAllowedRasterImageMimeType(headerContentType)) ||
          (!isGenericBinaryMimeType(blobContentType) &&
            !isAllowedRasterImageMimeType(blobContentType))
        ) {
          return null;
        }

        const inferredContentType = getRasterImageMimeTypeFromPath(safeImageSource);
        const contentType = [headerContentType, blobContentType, inferredContentType].find(
          (value) => isAllowedRasterImageMimeType(value)
        );

        if (!contentType) {
          return null;
        }

        return imageBlob.type ? imageBlob : new Blob([imageBlob], { type: contentType });
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
