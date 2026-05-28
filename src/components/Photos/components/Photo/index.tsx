import { getImageUrl } from '@app/utils/getImageUrl';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import { IImage } from '../..';
import Image from '@app/components/Image';
import { useObjectUrl } from '@app/hooks/useObjectUrl';
import Loader from '@app/components/Loader';
import { getSafeBackendMediaPath, getSafeS3BackendMediaPath } from '@app/utils/mediaSafety';

interface IPhotoProps {
  image: IImage;
  onClick?: () => void;
}

const Photo = ({ image, onClick }: IPhotoProps) => {
  const imageSources = [
    image?.securePhotoUrl,
    image?.url,
    image?.imageUrl,
    image?.messagePhotoUrl,
  ].filter((source): source is string => Boolean(source));
  const primaryImageSource = imageSources[0] || '';
  const firstImageQuery = useGetImageBlob(imageSources[0] || '');
  const secondImageQuery = useGetImageBlob(imageSources[1] || '');
  const thirdImageQuery = useGetImageBlob(imageSources[2] || '');
  const fourthImageQuery = useGetImageBlob(imageSources[3] || '');
  const imageQueries = [firstImageQuery, secondImageQuery, thirdImageQuery, fourthImageQuery];
  const imageBlob = imageQueries.find((query) => query.data)?.data;
  const isLoading = !imageBlob && imageQueries.some((query) => query.isLoading);
  const imageBlobUrl = useObjectUrl(imageBlob);
  const isBlobOnlySource = Boolean(
    getSafeBackendMediaPath(primaryImageSource) || getSafeS3BackendMediaPath(primaryImageSource)
  );

  if (primaryImageSource && isLoading) {
    return <Loader variant="inline" size="sm" label="Učitavanje slike..." />;
  }

  if (isBlobOnlySource && !imageBlobUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#eef3ff] px-4 text-center text-sm font-semibold text-gray-500">
        Fotografija se nije učitala
      </div>
    );
  }

  const src = imageBlobUrl || getImageUrl(image);
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#eef3ff] px-4 text-center text-sm font-semibold text-gray-500">
        Fotografija se nije učitala
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt="fotografija"
      onClick={onClick}
      className={`h-full w-full rounded-2xl object-cover transition-transform duration-300 ${
        onClick ? 'cursor-pointer group-hover:scale-[1.02]' : ''
      }`}
    />
  );
};
export default Photo;
