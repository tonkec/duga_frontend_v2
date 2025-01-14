import { useParams } from 'react-router';
import AppLayout from '../../components/AppLayout';
import { useGetSingleImage } from './hooks';
import { getPhotoUrl } from '../../utils/getPhotoUrl';
import Card from '../../components/Card';
import PhotoComments from '../../components/PhotoComments';
import PhotoLikes from '../../components/PhotoLikes';
import Loader from '../../components/Loader';
import notFound from '../../assets/not_found.svg';

const PhotoPage = () => {
  const { photoId } = useParams();
  const { singleImage, singleImageLoading } = useGetSingleImage(photoId as string);

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
            <img src={getPhotoUrl(singleImage?.data)} alt="Slika" />
            <PhotoLikes photoId={photoId} />
            <p className="mt-2 mb-2">{singleImage?.data.description}</p>
          </div>
          <div className="flex-1">
            <PhotoComments />
          </div>
        </div>
      </Card>
    </AppLayout>
  );
};

export default PhotoPage;
