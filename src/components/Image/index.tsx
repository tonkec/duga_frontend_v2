import useImage from '@app/hooks/useImage';
import Loader from '../Loader';

const Image = ({
  src,
  alt,
  className,
  style,
  loading,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  onClick?: () => void;
}) => {
  const isImageLoading = useImage(src);
  return isImageLoading ? (
    <Loader />
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading ? 'lazy' : undefined}
      onClick={onClick}
    />
  );
};

export default Image;
