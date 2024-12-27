import { useLocalStorage } from '@uidotdev/usehooks';
import AppLayout from '../../components/AppLayout';
import { useGetUserById } from '../../hooks/useGetUserById';
import Card from '../../components/Card';
import Avatar from 'react-avatar';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import { BiBody, BiSolidMap, BiStopwatch, BiBoltCircle } from 'react-icons/bi';
import { getUserBio } from '../../components/UserCard';
import Cta from '../../components/Cta';
import Iframe from 'react-iframe';
import Photos, { IImage } from '../../components/Photos';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { BiSolidCamera } from 'react-icons/bi';
import { BiSolidFile } from 'react-icons/bi';
import { BiCheckCircle } from 'react-icons/bi';
import { BiX } from 'react-icons/bi';

import 'react-tabs/style/react-tabs.css';
import { useNavigate } from 'react-router';
import { getProfilePhoto, getProfilePhotoUrl } from '../../utils/getProfilePhoto';

const getLookingForTranslation = (lookingFor: string) => {
  switch (lookingFor) {
    case 'friendship':
      return 'Prijateljstvo';
    case 'date':
      return 'Dejt';
    case 'relationship':
      return 'Vezu';
    case 'marriage':
      return 'Brak';
    case 'partnership':
      return 'Partnerstvo';
    case 'nothing':
      return 'Samo zujim';
    case 'idk':
      return 'Ne znam';
    default:
      return 'N/A';
  }
};

const getRelationshipStatusTranslation = (relationshipStatus: string) => {
  switch (relationshipStatus) {
    case 'single':
      return 'Single';
    case 'relationship':
      return 'U vezi';
    case 'marriage':
      return 'U braku';
    case 'partnership':
      return 'U partnerstvu';
    case 'inbetween':
      return 'Nešto izmedju';
    case 'divorced':
      return 'Razveden/a';
    case 'widowed':
      return 'Udovac/udovica';
    case 'separated':
      return 'Razdvojen/a';
    case 'open':
      return 'U otvorenoj vezi';
    case 'engaged':
      return 'Zaručen/a';
    case 'idk':
      return 'Ne znam';
    default:
      return 'N/A';
  }
};

const getFavoriteDayOfWeekTranslation = (favoriteDayOfWeek: string) => {
  switch (favoriteDayOfWeek) {
    case 'monday':
      return 'Ponedjeljak';
    case 'tuesday':
      return 'Utorak';
    case 'wednesday':
      return 'Srijeda';
    case 'thursday':
      return 'Četvrtak';
    case 'friday':
      return 'Petak';
    case 'saturday':
      return 'Subota';
    case 'sunday':
      return 'Nedjelja';
    default:
      return 'N/A';
  }
};

const MyProfilePage = () => {
  const navigate = useNavigate();
  const [userId] = useLocalStorage('userId');
  const { user: currentUser, isUserLoading } = useGetUserById(userId as string);
  const { allImages, allImagesLoading } = useGetAllImages(userId as string);

  if (allImagesLoading || isUserLoading) {
    return <AppLayout>Loading...</AppLayout>;
  }

  const allImagesWithoutProfilePhoto = allImages?.data.images.filter(
    (image: IImage) => !image.isProfilePhoto
  );

  return (
    <AppLayout>
      <Tabs selectedTabClassName="bg-black text-white rounded-t-md">
        <TabList style={{ borderBottom: 'none', marginBottom: 0 }}>
          <Tab style={{ border: 'none' }}>
            <div className="flex items-center gap-1">
              Općenito <BiSolidFile fontSize={25} />
            </div>
          </Tab>
          <Tab>
            <div className="flex items-center gap-1">
              Fotografije <BiSolidCamera fontSize={25} />
            </div>
          </Tab>
        </TabList>

        <TabPanel>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-3">
            <div className="lg:col-span-2">
              <Card>
                <div className="xl:flex gap-6">
                  <div>
                    <Avatar
                      name={`${currentUser?.data.firstName} ${currentUser?.data.lastName}`}
                      src={getProfilePhotoUrl(getProfilePhoto(allImages?.data.images))}
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
                        <BiSolidMap /> <b>Lokacija: </b> {currentUser?.data.location || 'N/A'}
                      </p>
                      <p className="flex items-center text-lg gap-2">
                        <BiBody /> <b>Rod: </b> {currentUser?.data.gender || 'N/A'}
                      </p>
                      <p className="flex items-center text-lg gap-2">
                        <BiBoltCircle /> <b>Seksualnost: </b> {currentUser?.data.sexuality || 'N/A'}
                      </p>
                      <p className="flex items-center text-lg gap-2">
                        <BiStopwatch /> <b>Godine: </b> {currentUser?.data.age || 'N/A'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 mt-20">
                      <p className="flex items-center text-lg gap-2 mt-[-8px]">
                        <b>Tražim:</b> {getLookingForTranslation(currentUser?.data.lookingFor)}
                      </p>
                      <p className="flex items-center text-lg gap-2">
                        <b>Trenutno sam: </b>{' '}
                        {getRelationshipStatusTranslation(currentUser?.data.relationshipStatus)}
                      </p>
                      <div className="flex gap-1">
                        <p className="flex items-center text-lg gap-1">
                          <b>Cigarete</b>{' '}
                          {currentUser?.data.cigarettes ? (
                            <BiCheckCircle fontSize={30} color="#34D399" />
                          ) : (
                            <BiX fontSize={30} color="#FF748B" />
                          )}
                        </p>
                        <p className="flex items-center text-lg gap-1">
                          <b>Alkohol</b>{' '}
                          {currentUser?.data.alcohol ? (
                            <BiCheckCircle fontSize={30} color="#34D399" />
                          ) : (
                            <BiX fontSize={30} color="#FF748B" />
                          )}
                        </p>

                        <p className="flex items-center text-lg gap-1">
                          <b>Sport</b>{' '}
                          {currentUser?.data.sport ? (
                            <BiCheckCircle fontSize={30} color="#34D399" />
                          ) : (
                            <BiX fontSize={30} color="#FF748B" />
                          )}
                        </p>
                      </div>

                      <p className="flex items-center text-lg gap-2">
                        <b>Najdraži dan u tjednu:</b>{' '}
                        {getFavoriteDayOfWeekTranslation(currentUser?.data.favoriteDayOfWeek)}
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
                  <p>{currentUser?.data.embarasement}</p>
                </div>

                <div className="mb-10">
                  <h2 className="font-bold mt-5">Imam previše godina za...</h2>
                  <p>{currentUser?.data.tooOldFor}</p>
                </div>

                <div className="mb-10">
                  <h2 className="font-bold mt-5">Dan mi je ljepši ako...</h2>
                  <p>{currentUser?.data.makesMyDay}</p>
                </div>

                <div className="mb-10">
                  <h2 className="font-bold mt-5">Duhovnost/religioznost</h2>
                  <p>{currentUser?.data.spirituality}</p>
                </div>

                <div className="mb-10">
                  <h2 className="font-bold mt-5">Interesi:</h2>
                  <p>{currentUser?.data.interests}</p>
                </div>

                <div className="mb-10">
                  <h2 className="font-bold mt-5">Jezici koje govorim: </h2>
                  <p>{currentUser?.data.languages}</p>
                </div>

                <div className="mb-10">
                  <h2 className="font-bold mb-5">Najdraža youtube pjesma</h2>
                  <Iframe url={currentUser?.data.favoriteSong} width="600" height="400" />
                </div>

                <div className="mb-10">
                  <h2 className="font-bold mb-5">Trailer za najdraži film</h2>
                  <Iframe url={currentUser?.data.favoriteMovie} width="600" height="400" />
                </div>

                <div className="mb-10">
                  <h2 className="font-bold mt-5">Za kraj ću reći još</h2>
                  <p>Ja sam najbolji na svijetu.</p>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1 max-w-[300px]">
              <Cta
                buttonText="Uredi profil"
                className="mb-4"
                subtitle="Impresioniraj ekipu svojim profilom."
                title="Uredi svoj profil!"
                onClick={() => {
                  navigate('/edit');
                }}
              />
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
        </TabPanel>
        <TabPanel>
          <Card>
            <Photos images={allImagesWithoutProfilePhoto} />
          </Card>
        </TabPanel>
      </Tabs>
    </AppLayout>
  );
};

export default MyProfilePage;
