import { useEffect, useState } from 'react';
import { isAllowedRasterImageMimeType } from '@app/utils/mediaSafety';

export const useObjectUrl = (source: Blob | null | undefined) => {
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    if (!source) {
      setObjectUrl('');
      return;
    }

    if (typeof URL.createObjectURL !== 'function') {
      setObjectUrl('');
      return;
    }

    if (!isAllowedRasterImageMimeType(source.type)) {
      setObjectUrl('');
      return;
    }

    const nextObjectUrl = URL.createObjectURL(source);
    setObjectUrl(nextObjectUrl);

    return () => {
      if (typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(nextObjectUrl);
      }
    };
  }, [source]);

  return objectUrl;
};

export const useObjectUrls = (sources: Blob[] | null | undefined) => {
  const [objectUrls, setObjectUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!sources?.length) {
      setObjectUrls([]);
      return;
    }

    if (typeof URL.createObjectURL !== 'function') {
      setObjectUrls([]);
      return;
    }

    const nextObjectUrls = sources.map((source) =>
      isAllowedRasterImageMimeType(source.type) ? URL.createObjectURL(source) : ''
    );
    setObjectUrls(nextObjectUrls);

    return () => {
      if (typeof URL.revokeObjectURL === 'function') {
        nextObjectUrls.filter(Boolean).forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
      }
    };
  }, [sources]);

  return objectUrls;
};
