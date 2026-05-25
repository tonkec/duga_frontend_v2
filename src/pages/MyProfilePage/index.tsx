import AppLayout from '@app/components/AppLayout';
import Card from '@app/components/Card';
import Cta from '@app/components/Cta';
import Photos from '@app/components/Photos';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { BiGlobe, BiHelpCircle, BiMessageRoundedDots, BiSolidCamera, BiSolidFile } from 'react-icons/bi';
import { useNavigate, useSearchParams } from 'react-router';
import UserProfileCard from '@app/components/UserProfileCard';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import 'react-tabs/style/react-tabs.css';
import Loader from '@app/components/Loader';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import AllUserPhotos, { getForumPhotos } from './components/AllUserPhotos';
import UserForumActivity, {
  getUserForumAnswers,
  getUserForumQuestions,
} from '@app/features/forum/components/UserForumActivity';
import { useQuestionDetails, useQuestions } from '@app/features/forum/hooks/useForum';

const tabClassName =
  'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-colors focus:outline-none';
const selectedTabClassName = 'bg-blue text-white shadow-sm';

const MyProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useGetCurrentUser();
  const currentUserId = currentUser?.data?.id;
  const { allImages, allImagesLoading } = useGetAllImages(currentUserId);
  const { allUserImages, allUserImagesLoading } = useGetAllUserImages();
  const {
    data: forumData,
    isError: isForumError,
    isPending: isForumLoading,
  } = useQuestions({ page: 1, limit: 100 });
  const numericCurrentUserId = Number(currentUserId);
  const profileImages = allImages?.data.images ?? [];
  const allUserPhotos = Array.isArray(allUserImages?.data)
    ? allUserImages.data
    : allUserImages?.data?.images ?? [];
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
  const userForumQuestions = Number.isFinite(numericCurrentUserId)
    ? getUserForumQuestions(forumQuestionsWithDetails, numericCurrentUserId)
    : [];
  const userForumAnswers = Number.isFinite(numericCurrentUserId)
    ? getUserForumAnswers(forumQuestionsWithDetails, numericCurrentUserId)
    : [];
  const forumPhotos = Number.isFinite(numericCurrentUserId)
    ? getForumPhotos(forumQuestionsWithDetails, numericCurrentUserId)
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
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5 mb-3">
          <div>
            <UserProfileCard
              user={currentUser?.data}
              allImages={profileImages}
              allImagesLoading={allImagesLoading}
            />
          </div>

          <div className="grid content-start items-start gap-4 md:grid-cols-2 xl:grid-cols-1">
            <Cta
              buttonText="Dopuni profil"
              subtitle="Dodaj detalje, interese i fotografije kako bi te drugi lakše upoznali."
              title="Predstavi se"
              onClick={() => {
                navigate('/edit');
              }}
            />
            <Cta
              buttonText="Započni razgovor"
              subtitle="Pronađi nekoga zanimljivog i pošalji prvu poruku."
              title="Vrijeme je za razgovor"
              onClick={() => {
                navigate('/new-chat');
              }}
            />
            <Cta
              buttonText="Istraži korisnike"
              subtitle="Pregledaj profile i pronađi osobe s kojima želiš kliknuti."
              title="Upoznaj zajednicu"
              onClick={() => {
                navigate('/users');
              }}
            />
            <Cta
              buttonText="Postavi pitanje"
              subtitle="Imaš dilemu ili trebaš savjet? Otvori temu na forumu i uključi zajednicu."
              title="Pitaj forum"
              onClick={() => {
                navigate('/forum/ask');
              }}
            />
          </div>
        </div>
      ),
    },
  ];

  if (profileImages.length > 0) {
    profileTabs.push({
      id: 'profile-photos',
      tab: (
        <div className="flex items-center gap-2">
          Profilne fotografije <BiSolidCamera fontSize={20} />
        </div>
      ),
      panel: (
        <Card className="rounded-2xl p-5">
          <Photos notFoundText="Nema fotografija" images={profileImages} />
        </Card>
      ),
    });
  }

  if (
    !allUserImagesLoading &&
    !isForumActivityLoading &&
    allUserPhotos.length + forumPhotos.length > 0
  ) {
    profileTabs.push({
      id: 'all-photos',
      tab: (
        <div className="flex items-center gap-2">
          Sve fotografije <BiGlobe fontSize={20} />
        </div>
      ),
      panel: (
        <Card className="rounded-2xl p-5">
          <AllUserPhotos />
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
          userId={currentUserId}
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
          userId={currentUserId}
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

  if (allImagesLoading) {
    return (
      <AppLayout>
        <Loader />
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
            <h1 className="text-3xl font-bold text-gray-900">Moj profil</h1>
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

export default MyProfilePage;
