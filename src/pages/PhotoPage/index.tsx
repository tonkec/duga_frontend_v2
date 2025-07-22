import { useParams } from 'react-router';
import AppLayout from '@app/components/AppLayout';
import { useGetSingleImage } from './hooks';
import { getPhotoUrl } from '@app/utils/getPhotoUrl';
import Card from '@app/components/Card';
import PhotoComments from '@app/components/PhotoComments';
import PhotoLikes from '@app/components/PhotoLikes';
import Loader from '@app/components/Loader';
import notFound from '@app/assets/not_found.svg';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';

const PhotoPage = () => {
  const { photoId } = useParams();
  const { singleImage, singleImageLoading } = useGetSingleImage(photoId as string);
  const { data: imageBlob } = useGetImageBlob(
    singleImage?.data?.securePhotoUrl || singleImage?.data?.url || ''
  );

  if (singleImageLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  if (!singleImage) {
    return (
      <AppLayout>
        <Card>
          <div className="flex flex-col justify-center items-center max-w-lg mx-auto">
            <img src={notFound} alt="Not found" />
            <p className="text-center">Slika nije pronađena ili je obrisana.</p>
          </div>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card>
        <div className="lg:flex gap-5 items-start">
          <div>
            {imageBlob ? (
              <img src={URL.createObjectURL(imageBlob)} alt="Korisnikova slika" />
            ) : (
              <img src={getPhotoUrl(singleImage?.data)} alt="Slika" />
            )}
            <PhotoLikes photoId={photoId} />
          </div>
          <div className="flex-1">
            {singleImage?.data?.description && (
              <p className="mt-2 mb-2 py-2">{singleImage?.data.description}</p>
            )}
            <PhotoComments />
          </div>
        </div>
      </Card>
    </AppLayout>
  );
};

export default PhotoPage;
