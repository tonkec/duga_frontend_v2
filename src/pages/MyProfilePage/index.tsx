import { useLocalStorage } from '@uidotdev/usehooks';
import AppLayout from '../../components/AppLayout';
import { useGetUserById } from '../../hooks/useGetUserById';
import Card from '../../components/Card';
import Avatar from 'react-avatar';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import { BiBody, BiSolidMap, BiStopwatch, BiBoltCircle } from 'react-icons/bi';
import { getUserBio } from '../../components/UserCard';
import Cta from '../../components/Cta';
import { Carousel } from 'react-responsive-carousel';
import Modal from 'react-modal';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useState } from 'react';
import Button from '../../components/Button';
import { BiArrowBack } from 'react-icons/bi';
import Iframe from 'react-iframe';

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
Modal.setAppElement('#root');
const customStyles = {
  content: {
    width: '600px',
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '750px',
  },
};

const MyProfilePage = () => {
  const [userId] = useLocalStorage('userId');
  const { user: currentUser, isUserLoading } = useGetUserById(userId as string);
  const { allImages, allImagesLoading } = useGetAllImages(userId as string);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  if (allImagesLoading || isUserLoading) {
    return <AppLayout>Loading...</AppLayout>;
  }

  const getProfilePhoto = allImages?.data.images.find((image: IImage) => image.isProfilePhoto);
  const allImagesWithoutProfilePhoto = allImages?.data.images.filter(
    (image: IImage) => !image.isProfilePhoto
  );

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
        <div className="col-span-2">
          <Card>
            <div className="flex gap-6">
              <div>
                <Avatar
                  name={`${currentUser?.data.firstName} ${currentUser?.data.lastName}`}
                  src={getProfilePhotoUrl(getProfilePhoto)}
                  size="300"
                  color="#2D46B9"
                  className="rounded"
                />
              </div>

              <div className="flex gap-6">
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl mb-4">
                    {currentUser?.data.firstName} {currentUser?.data.lastName}
                  </h1>
                  <p className="flex items-center text-lg gap-2">
                    <BiSolidMap /> <b>Lokacija: </b> {currentUser?.data.location}
                  </p>
                  <p className="flex items-center text-lg gap-2">
                    <BiBody /> <b>Rod: </b> {currentUser?.data.gender}
                  </p>
                  <p className="flex items-center text-lg gap-2">
                    <BiBoltCircle /> <b>Seksualnost: </b> {currentUser?.data.sexuality}
                  </p>
                  <p className="flex items-center text-lg gap-2">
                    <BiStopwatch /> <b>Godine: </b> {currentUser?.data.age}
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-20">
                  <p className="flex items-center text-lg gap-2 mt-[-8px]">
                    <b>Tražim:</b> ozbiljnu vezu
                  </p>
                  <p className="flex items-center text-lg gap-2">
                    <b>Trenutno sam: </b> Single
                  </p>
                  <p className="flex items-center text-lg gap-2">
                    <b>Cigarete:</b> Ne!
                  </p>
                  <p className="flex items-center text-lg gap-2">
                    <b>Alkohol:</b> Ne!
                  </p>
                  <p className="flex items-center text-lg gap-2">
                    <b>Interesi: </b> Kuglanje, bitcoin
                  </p>
                  <p className="flex items-center text-lg gap-2">
                    <b>Jezici koje govorim: </b> Hrvatski, Bosanski
                  </p>
                  <p className="flex items-center text-lg gap-2">
                    <b>Religija:</b> Ne!
                  </p>
                  <p className="flex items-center text-lg gap-2">
                    <b>Politika:</b> Apolitičnost
                  </p>
                  <p className="flex items-center text-lg gap-2">
                    <b>Najdraži dan u tjednu:</b> Petak
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="font-bold mt-5">O meni</h2>
              <p>{getUserBio(currentUser?.data.bio)}</p>
            </div>

            <div className="mb-10">
              <h2 className="font-bold mt-5">Najsramotnija stvar koja mi se dogodila</h2>
              <p>Ulovili su me dok piškim u javnosti</p>
            </div>

            <div className="mb-10">
              <h2 className="font-bold mt-5">Imam previše godina za...</h2>
              <p>izlaske petkom</p>
            </div>

            <div className="mb-10">
              <h2 className="font-bold mt-5">Dan mi je ljepši ako...</h2>
              <p>vidim svog psa</p>
            </div>

            <div className="mb-10">
              <h2 className="font-bold mb-5">Najdraža youtube pjesma</h2>
              <Iframe
                url="https://www.youtube.com/embed/iuz4Hp4-1uU?si=tDWcD5HsprpGMvY-"
                width="600"
                height="400"
              />
            </div>

            <div className="mb-10">
              <h2 className="font-bold mb-5">Trailer na najdraži film</h2>
              <Iframe
                url="https://www.youtube.com/embed/KnrRy6kSFF0?si=5q6UKW91IH7IG7Vh"
                width="600"
                height="400"
              />
            </div>

            <h2 className="font-bold mt-5 mb-2">Fotografije</h2>
            <div className="flex gap-5">
              {allImagesWithoutProfilePhoto.map((image: IImage, index: number) => {
                return (
                  <div className="max-w-[400px]">
                    <img
                      className="cursor-pointer"
                      src={`${REACT_APP_S3_BUCKET_URL}/${image.url}`}
                      alt="user image"
                      onClick={() => {
                        setIsModalOpen(!isModalOpen);
                        setImageIndex(index);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="col-span-1 max-w-[300px]">
          <Cta
            buttonText="Uredi profil"
            className="mb-4"
            subtitle="Impresioniraj ekipu svojim profilom."
            title="Uredi svoj profil!"
            onClick={() => {}}
          />{' '}
          <Cta
            buttonText="Pošalji poruku"
            subtitle="Možda te baš čeka zanimljiva osoba."
            title="Pošalji nekome poruku!"
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        style={customStyles}
      >
        <div>
          <Button type="icon" onClick={closeModal}>
            <BiArrowBack fontSize={20} />
          </Button>
          <Carousel selectedItem={imageIndex}>
            {allImagesWithoutProfilePhoto.map((image: IImage) => {
              return (
                <div className="relative">
                  <img
                    className="cursor-pointer"
                    src={`${REACT_APP_S3_BUCKET_URL}/${image.url}`}
                    alt="user image"
                  />
                  <p className="absolute top-0 px-4 py-2 w-full bg-black text-white">
                    {' '}
                    {image.description}
                  </p>
                </div>
              );
            })}
          </Carousel>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default MyProfilePage;
