import useImage from '@app/hooks/useImage';
import Loader from '../Loader';

const Image = ({
  src,
  alt,
  className,
  style,
  loading,
  onClick,
  referrerPolicy,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  onClick?: () => void;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}) => {
  const isImageLoading = useImage(src);
  return isImageLoading ? (
    <Loader variant="inline" size="sm" label="Učitavanje slike..." />
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading ? 'lazy' : undefined}
      onClick={onClick}
      referrerPolicy={referrerPolicy}
    />
  );
};

export default Image;
