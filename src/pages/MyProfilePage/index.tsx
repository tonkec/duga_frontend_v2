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
                      <p className="flex items-center text-lg gap-2">
                        <b>Cigarete:</b> {currentUser?.data.cigarettes ? 'Da' : 'Ne'}
                      </p>
                      <p className="flex items-center text-lg gap-2">
                        <b>Alkohol:</b> {currentUser?.data.alcohol ? 'Da' : 'Ne'}
                      </p>

                      <p className="flex items-center text-lg gap-2">
                        <b>Sport:</b> {currentUser?.data.sport ? 'Da' : 'Ne'}
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
                  <h2 className="font-bold mb-5">Trailer za najdraži film</h2>
                  <Iframe
                    url="https://www.youtube.com/embed/KnrRy6kSFF0?si=5q6UKW91IH7IG7Vh"
                    width="600"
                    height="400"
                  />
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
