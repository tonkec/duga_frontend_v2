import { useLocalStorage } from '@uidotdev/usehooks';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import Cta from '../../components/Cta';
import Photos from '../../components/Photos';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { BiSolidCamera, BiSolidFile } from 'react-icons/bi';
import { useNavigate } from 'react-router';
import UserProfileCard from '../../components/UserProfileCard';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import 'react-tabs/style/react-tabs.css';
import { useGetUserById } from '../../hooks/useGetUserById';
import Loader from '../../components/Loader';

const MyProfilePage = () => {
  const navigate = useNavigate();
  const [userId] = useLocalStorage('userId');
  const { allImages, allImagesLoading } = useGetAllImages(userId as string);
  const { user: currentUser } = useGetUserById(userId as string);
  console.log('allImages', allImages);
  if (allImagesLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

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
              <UserProfileCard
                user={currentUser?.data}
                allImages={allImages?.data.images}
                allImagesLoading={allImagesLoading}
              />
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
                onClick={() => {
                  navigate('/new-chat');
                }}
              />
              <Cta
                buttonText="Pretraži ekipu"
                className="mt-4"
                subtitle="Istraži koga ima okolo."
                title="Istraži!"
                onClick={() => {
                  navigate('/');
                }}
              />
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <Card>
            <Photos notFoundText="Nema fotografija" images={allImages?.data.images} />
          </Card>
        </TabPanel>
      </Tabs>
    </AppLayout>
  );
};

export default MyProfilePage;
