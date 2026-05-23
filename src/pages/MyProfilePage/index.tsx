import AppLayout from '@app/components/AppLayout';
import Card from '@app/components/Card';
import Cta from '@app/components/Cta';
import Photos from '@app/components/Photos';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { BiSolidCamera, BiSolidFile, BiGlobe } from 'react-icons/bi';
import { useNavigate } from 'react-router';
import UserProfileCard from '@app/components/UserProfileCard';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import 'react-tabs/style/react-tabs.css';
import Loader from '@app/components/Loader';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import AllUserPhotos from './components/AllUserPhotos';

const tabClassName =
  'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-colors focus:outline-none';
const selectedTabClassName = 'bg-blue text-white shadow-sm';

const MyProfilePage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useGetCurrentUser();
  const currentUserId = currentUser?.data?.id;
  const { allImages, allImagesLoading } = useGetAllImages(currentUserId);

  if (allImagesLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Tabs selectedTabClassName={selectedTabClassName}>
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Moj profil</h1>
          </div>

          <TabList className="flex flex-wrap gap-2 rounded-2xl border border-[#dce4ff] bg-white p-2 shadow-sm">
            <Tab className={tabClassName}>
              <div className="flex items-center gap-2">
                Općenito <BiSolidFile fontSize={20} />
              </div>
            </Tab>
            <Tab className={tabClassName}>
              <div className="flex items-center gap-2">
                Profilne fotografije <BiSolidCamera fontSize={20} />
              </div>
            </Tab>

            <Tab className={tabClassName}>
              <div className="flex items-center gap-2">
                Sve fotografije <BiGlobe fontSize={20} />
              </div>
            </Tab>
          </TabList>
        </div>

        <TabPanel>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5 mb-3">
            <div>
              <UserProfileCard
                user={currentUser?.data}
                allImages={allImages?.data.images}
                allImagesLoading={allImagesLoading}
              />
            </div>

            <div className="grid content-start items-start gap-4 md:grid-cols-3 xl:grid-cols-1">
              <Cta
                buttonText="Uredi profil"
                subtitle="Dodaj detalje i fotografije."
                title="Uredi profil"
                onClick={() => {
                  navigate('/edit');
                }}
              />
              <Cta
                buttonText="Nova poruka"
                subtitle="Započni razgovor s nekim."
                title="Poruke"
                onClick={() => {
                  navigate('/new-chat');
                }}
              />
              <Cta
                buttonText="Korisnici"
                subtitle="Pogledaj tko je online."
                title="Istraži"
                onClick={() => {
                  navigate('/users');
                }}
              />
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <Card className="rounded-2xl p-5">
            <Photos notFoundText="Nema fotografija" images={allImages?.data.images} />
          </Card>
        </TabPanel>

        <TabPanel>
          <Card className="rounded-2xl p-5">
            <AllUserPhotos />
          </Card>
        </TabPanel>
      </Tabs>
    </AppLayout>
  );
};

export default MyProfilePage;
