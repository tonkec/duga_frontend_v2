import { useState, useEffect, useCallback } from 'react';

const useImage = (
  image: string,
  referrerPolicy: React.HTMLAttributeReferrerPolicy = 'no-referrer'
) => {
  const [loading, setLoading] = useState(true);

  const getImage = useCallback(() => {
    if (!image) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const img = new Image();
    img.referrerPolicy = referrerPolicy;
    img.src = image;
    img.onload = function () {
      setLoading(false);
    };
    img.onerror = function () {
      setLoading(false);
    };
  }, [image, referrerPolicy]);

  useEffect(() => {
    getImage();
  }, [getImage]);

  return loading;
};

export default useImage;
