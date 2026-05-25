import { useNavigate, useParams, useSearchParams } from 'react-router';
import AppLayout from '@app/components/AppLayout';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { BiHelpCircle, BiMessageRoundedDots, BiSolidCamera, BiSolidFile } from 'react-icons/bi';
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
import UserForumActivity, {
  getUserForumAnswers,
  getUserForumQuestions,
} from '@app/features/forum/components/UserForumActivity';
import { useQuestionDetails, useQuestions } from '@app/features/forum/hooks/useForum';

const getChatWithUser = (userChats: IChat[] | undefined, userId: string | undefined) => {
  if (!userId) return undefined;

  return userChats?.find((chat) => chat.Users[0]?.id === Number(userId));
};

const tabClassName =
  'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-colors focus:outline-none';
const selectedTabClassName = 'bg-blue text-white shadow-sm';

const OtherUserPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userId } = useParams();
  const { allImages, allImagesLoading } = useGetAllImages(userId as string);
  const { user: otherUser, isUserLoading } = useGetUserById(userId as string);
  const { userChats } = useGetAllUserChats();
  const existingChat = getChatWithUser(userChats?.data, userId);
  const {
    data: forumData,
    isError: isForumError,
    isPending: isForumLoading,
  } = useQuestions({ page: 1, limit: 100 });
  const numericUserId = Number(userId);
  const profileImages = allImages?.data.images ?? [];
  const forumQuestions = forumData?.data ?? [];
  const forumDetailQueries = useQuestionDetails(forumQuestions);
  const detailedForumQuestions = forumDetailQueries
    .map((query) => query.data)
    .filter((question): question is NonNullable<typeof question> => Boolean(question));
  const forumQuestionsWithDetails = forumQuestions.map(
    (question) =>
      detailedForumQuestions.find((detailedQuestion) => detailedQuestion.id === question.id) ??
      question
  );
  const isForumDetailsLoading = forumDetailQueries.some((query) => query.isPending);
  const isForumActivityLoading = isForumLoading || isForumDetailsLoading;
  const userForumQuestions = Number.isFinite(numericUserId)
    ? getUserForumQuestions(forumQuestionsWithDetails, numericUserId)
    : [];
  const userForumAnswers = Number.isFinite(numericUserId)
    ? getUserForumAnswers(forumQuestionsWithDetails, numericUserId)
    : [];

  const profileTabs = [
    {
      id: 'general',
      tab: (
        <div className="flex items-center gap-2">
          Općenito <BiSolidFile fontSize={20} />
        </div>
      ),
      panel: (
        <div className="grid grid-cols-1 gap-5 mb-3 xl:grid-cols-[1fr_280px]">
          <div className="min-w-0">
            <UserProfileCard
              user={otherUser?.data}
              allImages={profileImages}
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
      ),
    },
  ];

  if (profileImages.length > 0) {
    profileTabs.push({
      id: 'photos',
      tab: (
        <div className="flex items-center gap-2">
          Fotografije <BiSolidCamera fontSize={20} />
        </div>
      ),
      panel: (
        <Card className="rounded-2xl p-5">
          <Photos notFoundText="Nema fotografija" images={profileImages} />
        </Card>
      ),
    });
  }

  if (!isForumActivityLoading && userForumQuestions.length > 0) {
    profileTabs.push({
      id: 'questions',
      tab: (
        <div className="flex items-center gap-2">
          Pitanja <BiHelpCircle fontSize={20} />
        </div>
      ),
      panel: (
        <UserForumActivity
          isError={isForumError}
          isLoading={isForumActivityLoading}
          questions={forumQuestionsWithDetails}
          userId={userId}
          type="questions"
        />
      ),
    });
  }

  if (!isForumActivityLoading && userForumAnswers.length > 0) {
    profileTabs.push({
      id: 'answers',
      tab: (
        <div className="flex items-center gap-2">
          Odgovori <BiMessageRoundedDots fontSize={20} />
        </div>
      ),
      panel: (
        <UserForumActivity
          isError={isForumError}
          isLoading={isForumActivityLoading}
          questions={forumQuestionsWithDetails}
          userId={userId}
          type="answers"
        />
      ),
    });
  }

  const selectedTabIndex = Math.max(
    profileTabs.findIndex((tab) => tab.id === searchParams.get('tab')),
    0
  );

  const handleTabSelect = (index: number) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('tab', profileTabs[index].id);
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
            {profileTabs.map((tab) => (
              <Tab key={tab.id} className={tabClassName}>
                {tab.tab}
              </Tab>
            ))}
          </TabList>
        </div>

        {profileTabs.map((tab) => (
          <TabPanel key={tab.id}>{tab.panel}</TabPanel>
        ))}
      </Tabs>
    </AppLayout>
  );
};

export default OtherUserPage;
