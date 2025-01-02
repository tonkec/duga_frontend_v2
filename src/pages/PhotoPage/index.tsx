import { useParams } from 'react-router';
import AppLayout from '../../components/AppLayout';
import { useGetSingleImage } from './hooks';
import { getPhotoUrl } from '../../utils/getPhotoUrl';
import Card from '../../components/Card';
import PhotoComments from '../../components/PhotoComments';

const PhotoPage = () => {
  const { photoId } = useParams();
  const { singleImage, singleImageLoading } = useGetSingleImage(photoId as string);

  if (singleImageLoading) {
    return <AppLayout>Učitavam sliku...</AppLayout>;
  }

  return (
    <AppLayout>
      <Card>
        <div className="lg:flex gap-5 items-end">
          <div>
            <img src={getPhotoUrl(singleImage?.data)} alt="Slika" />
            <p>PHoto likes</p>
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
