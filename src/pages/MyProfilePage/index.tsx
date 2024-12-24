import { useLocalStorage } from '@uidotdev/usehooks';
import AppLayout from '../../components/AppLayout';
import { useGetUserById } from '../../hooks/useGetUserById';
import Card from '../../components/Card';
import Avatar from 'react-avatar';
import { useGetAllImages } from '../../hooks/useGetAllImages';

interface IImage {
  createdAt: string;
  description: string;
  fileType: string;
  id: number;
  isProfilePhoto: boolean;
  name: string;
  updatedAt: string;
  url: string;
  userId: string;
}

const REACT_APP_S3_BUCKET_URL = 'https://duga-user-photo.s3.eu-north-1.amazonaws.com';

const getProfilePhotoUrl = (profilePhoto: IImage) => {
  if (profilePhoto) {
    return `${REACT_APP_S3_BUCKET_URL}/${profilePhoto.url}`;
  }
};

const MyProfilePage = () => {
  const [userId] = useLocalStorage('userId');
  const { user: currentUser, isUserLoading } = useGetUserById(userId as string);
  const { allImages, allImagesLoading } = useGetAllImages(userId as string);

  if (allImagesLoading || isUserLoading) {
    return <AppLayout>Loading...</AppLayout>;
  }

  const getProfilePhoto = allImages?.data.images.find((image: IImage) => image.isProfilePhoto);
  const allImagesWithoutProfilePhoto = allImages?.data.images.filter(
    (image: IImage) => !image.isProfilePhoto
  );

  return (
    <AppLayout>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div>
            <Avatar
              name={`${currentUser?.data.firstName} ${currentUser?.data.lastName}`}
              src={getProfilePhotoUrl(getProfilePhoto)}
              size="150"
              color="#2D46B9"
            />
          </div>
          <div>
            <h1>
              {currentUser?.data.firstName} {currentUser?.data.lastName}
            </h1>
            <p>{currentUser?.data.email}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card>
          <div className="grid grid-cols-3 gap-4">
            {allImagesWithoutProfilePhoto.map((image: IImage) => (
              <div key={image.id}>
                <img src={`${REACT_APP_S3_BUCKET_URL}/${image.url}`} alt={image.name} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default MyProfilePage;
