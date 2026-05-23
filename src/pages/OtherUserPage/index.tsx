import { useNavigate, useParams } from 'react-router';
import AppLayout from '@app/components/AppLayout';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { BiSolidCamera, BiSolidFile } from 'react-icons/bi';
import UserProfileCard from '@app/components/UserProfileCard';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import Cta from '@app/components/Cta';
import Card from '@app/components/Card';
import Photos from '@app/components/Photos';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Loader from '@app/components/Loader';
import SendMessageButton from '@app/components/SendMessageButton';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import { IChat } from '@app/pages/NewChatPage/hooks';

const getChatWithUser = (userChats: IChat[] | undefined, userId: string | undefined) => {
  if (!userId) return undefined;

  return userChats?.find((chat) => chat.Users[0]?.id === Number(userId));
};

const OtherUserPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { allImages, allImagesLoading } = useGetAllImages(userId as string);
  const { user: otherUser, isUserLoading } = useGetUserById(userId as string);
  const { userChats } = useGetAllUserChats();
  const existingChat = getChatWithUser(userChats?.data, userId);

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
                  buttonType="blue"
                  buttonClasses="w-full"
                  hasChatWithUser={Boolean(existingChat)}
                  existingChatId={existingChat?.id}
                />
              </Cta>
              <Cta
                className="mt-4"
                buttonText="Prijavi problem"
                subtitle="Ako primijetiš bilo kakav problem s ovim profilom, slobodno ga prijavi putem forme."
                title="Postoji li problem?"
                onClick={() => navigate(`/report/`)}
              />
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <Card className="p-6 rounded">
            <Photos notFoundText="Nema fotografija" images={allImages?.data.images} />
          </Card>
        </TabPanel>
      </Tabs>
    </AppLayout>
  );
};

export default OtherUserPage;
