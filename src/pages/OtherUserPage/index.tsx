import { useNavigate, useParams, useSearchParams } from 'react-router';
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

const tabClassName =
  'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-colors focus:outline-none';
const selectedTabClassName = 'bg-blue text-white shadow-sm';
const profileTabs = ['general', 'photos'];

const OtherUserPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userId } = useParams();
  const { allImages, allImagesLoading } = useGetAllImages(userId as string);
  const { user: otherUser, isUserLoading } = useGetUserById(userId as string);
  const { userChats } = useGetAllUserChats();
  const existingChat = getChatWithUser(userChats?.data, userId);
  const selectedTabIndex = Math.max(profileTabs.indexOf(searchParams.get('tab') || ''), 0);

  const handleTabSelect = (index: number) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('tab', profileTabs[index]);
    setSearchParams(nextSearchParams);
  };

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
      <Tabs
        selectedIndex={selectedTabIndex}
        onSelect={handleTabSelect}
        selectedTabClassName={selectedTabClassName}
      >
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{otherUser?.data?.username}</h1>
          </div>

          <TabList className="flex flex-wrap gap-2 rounded-2xl border border-[#dce4ff] bg-white p-2 shadow-sm">
            <Tab className={tabClassName}>
              <div className="flex items-center gap-2">
                Općenito <BiSolidFile fontSize={20} />
              </div>
            </Tab>
            <Tab className={tabClassName}>
              <div className="flex items-center gap-2">
                Fotografije <BiSolidCamera fontSize={20} />
              </div>
            </Tab>
          </TabList>
        </div>

        <TabPanel>
          <div className="grid grid-cols-1 gap-5 mb-3 xl:grid-cols-[1fr_280px]">
            <div className="min-w-0">
              <UserProfileCard
                user={otherUser?.data}
                allImages={allImages?.data.images}
                allImagesLoading={allImagesLoading}
              />
            </div>

            <aside className="grid content-start items-start gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Cta subtitle="Pošalji poruku ovoj osobici." title="Pošalji poruku!">
                <SendMessageButton
                  sendMessageToId={userId as string}
                  buttonType="blue"
                  buttonClasses="w-full rounded-full py-3 font-semibold shadow-md shadow-blue/15"
                  hasChatWithUser={Boolean(existingChat)}
                  existingChatId={existingChat?.id}
                />
              </Cta>
              <Cta
                buttonText="Prijavi problem"
                subtitle="Ako primijetiš bilo kakav problem s ovim profilom, slobodno ga prijavi putem forme."
                title="Postoji li problem?"
                onClick={() => navigate(`/report/`)}
              />
            </aside>
          </div>
        </TabPanel>
        <TabPanel>
          <Card className="rounded-2xl p-5">
            <Photos notFoundText="Nema fotografija" images={allImages?.data.images} />
          </Card>
        </TabPanel>
      </Tabs>
    </AppLayout>
  );
};

export default OtherUserPage;
