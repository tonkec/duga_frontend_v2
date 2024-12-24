import { useLocalStorage } from '@uidotdev/usehooks';
import AppLayout from '../../components/AppLayout';
import { useGetUserById } from '../../hooks/useGetUserById';
import Card from '../../components/Card';
import Avatar from 'react-avatar';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import { BiBody, BiSolidMap, BiStopwatch, BiBoltCircle } from 'react-icons/bi';
import Button from '../../components/Button';
import { Link } from 'react-router';
import { getUserBio } from '../../components/UserCard';

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
      <Button type="primary" onClick={() => {}} className="mb-5">
        <Link to="/edit-profile">Edit profile</Link>
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div className="col-span-1">
          <Card className="grid grid-cols-12">
            <div className="col-span-5">
              <Avatar
                name={`${currentUser?.data.firstName} ${currentUser?.data.lastName}`}
                src={getProfilePhotoUrl(getProfilePhoto)}
                size="200"
                color="#2D46B9"
                className="rounded"
              />
            </div>

            <div className="col-span-6">
              <h1>
                {currentUser?.data.firstName} {currentUser?.data.lastName}
              </h1>
              <p className="flex items-center text-lg">
                <BiSolidMap /> {currentUser?.data.location}
              </p>
              <p className="flex items-center text-lg">
                <BiBody /> {currentUser?.data.gender}
              </p>
              <p className="flex items-center text-lg">
                <BiBoltCircle /> {currentUser?.data.sexuality}
              </p>
              <p className="flex items-center text-lg">
                <BiStopwatch /> {currentUser?.data.age} godina
              </p>
            </div>

            <div className="col-span-12">
              <h2 className="font-bold mt-5">O meni</h2>
              <p>{getUserBio(currentUser?.data.bio)}</p>
            </div>
          </Card>
        </div>

        <div className="col-span-2">
          <Card>
            <div className="grid grid-cols-3 gap-10">
              {allImagesWithoutProfilePhoto.map((image: IImage) => (
                <div key={image.id}>
                  <img
                    src={`${REACT_APP_S3_BUCKET_URL}/${image.url}`}
                    alt={image.name}
                    className="rounded"
                  />
                  <p className="mt-4">{image.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default MyProfilePage;
