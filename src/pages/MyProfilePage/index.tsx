import AppLayout from '@app/components/AppLayout';
import Card from '@app/components/Card';
import Cta from '@app/components/Cta';
import Photos from '@app/components/Photos';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Select from 'react-select';
import {
  BiGlobe,
  BiHelpCircle,
  BiLink,
  BiMessageRoundedDots,
  BiShow,
  BiSolidCamera,
  BiSolidFile,
} from 'react-icons/bi';
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
import ProfileViews from './components/ProfileViews';
import ProfileSharePanel from '@app/components/ProfileSharePanel';

const tabClassName =
  'shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-colors focus:outline-none';
const selectedTabClassName = 'bg-blue text-white shadow-sm';
const profileTabSelectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: '3rem',
    borderRadius: '1rem',
    borderColor: state.isFocused ? '#2D46B9' : '#dce4ff',
    boxShadow: state.isFocused ? '0 0 0 1px #2D46B9' : '0 1px 2px rgba(15, 23, 42, 0.05)',
    '&:hover': {
      borderColor: '#2D46B9',
    },
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    padding: '0 0.875rem',
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    borderRadius: '1rem',
    overflow: 'hidden',
    border: '1px solid #dce4ff',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
    zIndex: 20,
  }),
  option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2D46B9' : state.isFocused ? '#f0f4ff' : 'white',
    color: state.isSelected ? 'white' : '#111827',
  }),
};
const getProfileTabLabel = (tabId: string) => {
  const labels: Record<string, string> = {
    general: 'Općenito',
    'profile-photos': 'Profilne fotografije',
    'all-photos': 'Sve fotografije',
    'profile-views': 'Pregledi',
    share: 'Podijeli profil',
    questions: 'Pitanja',
    answers: 'Odgovori',
  };

  return labels[tabId] ?? tabId;
};

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
    : (allUserImages?.data?.images ?? []);
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
              className="profile-cta-edit !border-[#dce4ff] !from-white !via-[#f8fbff] !to-[#eef4ff]"
              icon={<BiSolidFile size={23} />}
              iconClassName="bg-blue/10 text-blue"
              buttonClassName="bg-blue shadow-blue/15 hover:bg-blue-dark"
              buttonText="Dopuni profil"
              subtitle="Dodaj detalje, interese i fotografije kako bi te drugi lakše upoznali."
              title="Predstavi se"
              onClick={() => {
                navigate('/edit');
              }}
            />
            <Cta
              className="profile-cta-chat !border-[#d8f0ef] !from-white !via-[#f7fdfc] !to-[#eaf8f6]"
              icon={<BiMessageRoundedDots size={23} />}
              iconClassName="bg-teal-100 text-teal-700"
              buttonClassName="bg-teal-600 shadow-teal-600/15 hover:bg-teal-700"
              buttonText="Započni razgovor"
              subtitle="Pronađi nekoga zanimljivog i pošalji prvu poruku."
              title="Vrijeme je za razgovor"
              onClick={() => {
                navigate('/new-chat');
              }}
            />
            <Cta
              className="profile-cta-community !border-[#eadcff] !from-white !via-[#fbf8ff] !to-[#f2ecff]"
              icon={<BiGlobe size={23} />}
              iconClassName="bg-violet-100 text-violet-700"
              buttonClassName="bg-violet-600 shadow-violet-600/15 hover:bg-violet-700"
              buttonText="Istraži korisnike"
              subtitle="Pregledaj profile i pronađi osobe s kojima želiš kliknuti."
              title="Upoznaj zajednicu"
              onClick={() => {
                navigate('/users');
              }}
            />
            <Cta
              className="profile-cta-forum !border-[#ffe1c7] !from-white !via-[#fffaf5] !to-[#fff1e4]"
              icon={<BiHelpCircle size={24} />}
              iconClassName="bg-orange-100 text-orange-700"
              buttonClassName="bg-orange-500 shadow-orange-500/15 hover:bg-orange-600"
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

  profileTabs.push({
    id: 'profile-views',
    tab: (
      <div className="flex items-center gap-2">
        Pregledi <BiShow fontSize={20} />
      </div>
    ),
    panel: (
      <Card className="rounded-2xl p-5">
        <ProfileViews />
      </Card>
    ),
  });

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

  profileTabs.push({
    id: 'share',
    tab: (
      <div className="flex items-center gap-2">
        Podijeli profil <BiLink fontSize={20} />
      </div>
    ),
    panel: (
      <ProfileSharePanel
        userId={currentUserId}
        publicId={currentUser?.data?.publicId}
        username={currentUser?.data?.username}
        isOwnProfile
      />
    ),
  });

  const selectedTabIndex = Math.max(
    profileTabs.findIndex((tab) => tab.id === searchParams.get('tab')),
    0
  );
  const profileTabOptions = profileTabs.map((tab, index) => ({
    value: index,
    label: getProfileTabLabel(tab.id),
  }));

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
        <div className="mb-5 flex flex-col items-start gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Moj profil</h1>

          <label className="block w-full lg:hidden">
            <span className="sr-only">Odaberi sekciju profila</span>
            <Select
              value={profileTabOptions[selectedTabIndex]}
              onChange={(option) => {
                if (option) {
                  handleTabSelect(option.value);
                }
              }}
              options={profileTabOptions}
              styles={profileTabSelectStyles}
              classNamePrefix="react-select"
              isSearchable={false}
            />
          </label>

          <TabList className="hidden w-full max-w-full flex-nowrap justify-start gap-2 overflow-x-auto rounded-2xl border border-[#dce4ff] bg-white p-2 shadow-sm lg:flex lg:flex-wrap">
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
