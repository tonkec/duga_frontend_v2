import { useEffect, useState } from 'react';

export const useObjectUrl = (source: Blob | MediaSource | null | undefined) => {
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

export const useObjectUrls = (sources: Array<Blob | MediaSource> | null | undefined) => {
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

    const nextObjectUrls = sources.map((source) => URL.createObjectURL(source));
    setObjectUrls(nextObjectUrls);

    return () => {
      if (typeof URL.revokeObjectURL === 'function') {
        nextObjectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
      }
    };
  }, [sources]);

  return objectUrls;
};
