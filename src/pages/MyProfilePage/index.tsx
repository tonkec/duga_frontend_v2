import { useLocalStorage } from '@uidotdev/usehooks';
import AppLayout from '../../components/AppLayout';
import { useGetUserById } from '../../hooks/useGetUserById';
import Card from '../../components/Card';
import Avatar from 'react-avatar';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import { BiBody, BiSolidMap, BiStopwatch, BiBoltCircle } from 'react-icons/bi';
import { getUserBio } from '../../components/UserCard';
import Cta from '../../components/Cta';

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
  // const allImagesWithoutProfilePhoto = allImages?.data.images.filter(
  //   (image: IImage) => !image.isProfilePhoto
  // );

  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div className="col-span-2">
          <Card>
            <div className="flex gap-6">
              <div className="">
                <Avatar
                  name={`${currentUser?.data.firstName} ${currentUser?.data.lastName}`}
                  src={getProfilePhotoUrl(getProfilePhoto)}
                  size="300"
                  color="#2D46B9"
                  className="rounded"
                />
              </div>

              <div className="">
                <h1 className="text-3xl mb-4">
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
            </div>

            <div className="">
              <h2 className="font-bold mt-5">O meni</h2>
              <p>{getUserBio(currentUser?.data.bio)}</p>
            </div>
          </Card>
        </div>

        <div className="col-span-1 max-w-[300px]">
          <Cta
            buttonText="Pošalji"
            subtitle="Možda te baš čeka zanimljiva osoba."
            title="Pošalji nekome poruku!"
            onClick={() => {}}
          />
          <Cta
            buttonText="Uredi"
            className="mt-4"
            subtitle="Impresioniraj ekipu svojim profilom."
            title="Uredi svoj profil!"
            onClick={() => {}}
          />
          <Cta
            buttonText="Pretraži ekipu"
            className="mt-4"
            subtitle="Istraži koga ima okolo."
            title="Istraži!"
            onClick={() => {}}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default MyProfilePage;
