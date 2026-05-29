import { useEffect, useState } from 'react';
import Image from '../Image';
import { getStoredThemePreference } from '@app/hooks/useThemePreference';

const lightThemeColors = {
  primary: '#2D46B9',
  soft: '#93C5FD',
};

const darkThemeColors = {
  primary: '#00adb5',
  soft: '#7ee4e8',
  white: '#393e46',
};

const darkThemeWhiteColors = ['#f2f2f2', '#F2F2F2', '#fff', '#FFF', '#ffffff', '#FFFFFF'];

const replaceSvgThemeColors = (svg: string, isDarkMode: boolean) => {
  const nextColors = isDarkMode ? darkThemeColors : lightThemeColors;
  const themedSvg = svg
    .split(lightThemeColors.primary)
    .join(nextColors.primary)
    .split(lightThemeColors.soft)
    .join(nextColors.soft);

  if (!isDarkMode) {
    return themedSvg;
  }

  return darkThemeWhiteColors.reduce(
    (nextSvg, whiteColor) => nextSvg.split(whiteColor).join(darkThemeColors.white),
    themedSvg
  );
};

const ThemedSvgImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [themedSrc, setThemedSrc] = useState(src);
  const isDarkMode = getStoredThemePreference() === 'dark';

  useEffect(() => {
    let objectUrl: string | undefined;
    let isCancelled = false;

    const applyThemeToSvg = async () => {
      const response = await fetch(src);
      const svg = await response.text();
      if (isCancelled) return;

      objectUrl = URL.createObjectURL(
        new Blob([replaceSvgThemeColors(svg, isDarkMode)], {
          type: 'image/svg+xml',
        })
      );
      setThemedSrc(objectUrl);
    };

    applyThemeToSvg().catch(() => setThemedSrc(src));

    return () => {
      isCancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isDarkMode, src]);

  return <Image src={themedSrc} alt={alt} className={className} />;
};

export default ThemedSvgImage;
