import useImage from '@app/hooks/useImage';
import Loader from '../Loader';

const Image = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const isImageLoading = useImage(src);
  return isImageLoading ? <Loader /> : <img src={src} alt={alt} className={className} />;
};

export default Image;
