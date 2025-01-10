import { useParams } from 'react-router';
import AppLayout from '../../components/AppLayout';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { BiSolidCamera, BiSolidFile } from 'react-icons/bi';
import UserProfileCard from '../../components/UserProfileCard';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import Cta from '../../components/Cta';
import Card from '../../components/Card';
import Photos from '../../components/Photos';
import { useGetUserById } from '../../hooks/useGetUserById';
import Loader from '../../components/Loader';
import SendMessageButton from '../../components/SendMessageButton';

const OtherUserPage = () => {
  const { userId } = useParams();
  const { allImages, allImagesLoading } = useGetAllImages(userId as string);
  const { user: otherUser, isUserLoading } = useGetUserById(userId as string);

  if (!userId || isNaN(Number(userId))) {
    return (
      <AppLayout>
        <p>Korisnik_ca nije pronađen_a!</p>
      </AppLayout>
    );
  }

  if (isUserLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  if (!otherUser) {
    return (
      <AppLayout>
        <p>Korisnik_ca nije pronađen_a!</p>
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
                user={otherUser?.data}
                allImages={allImages?.data.images}
                allImagesLoading={allImagesLoading}
              />
            </div>
            <div className="lg:col-span-1 max-w-[300px]">
              <Cta subtitle="Pošalji poruku ovoj osobici." title="Pošalji poruku!">
                <SendMessageButton
                  sendMessageToId={userId as string}
                  buttonType="blue-dark"
                  buttonClasses="w-full"
                />
              </Cta>
              <Cta
                className="mt-4"
                buttonText="Zaprati"
                subtitle="Zaprati ovu zanimljivu osobicu."
                title="Zaprati me!"
                onClick={() => {}}
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

export default OtherUserPage;
