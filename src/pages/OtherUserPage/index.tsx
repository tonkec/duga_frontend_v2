import { useNavigate, useParams, useSearchParams } from 'react-router';
import AppLayout from '@app/components/AppLayout';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Select from 'react-select';
import {
  BiFlag,
  BiHelpCircle,
  BiLink,
  BiMessageRoundedDots,
  BiSolidCamera,
  BiSolidFile,
  BiUserX,
} from 'react-icons/bi';
import UserProfileCard from '@app/components/UserProfileCard';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import Cta from '@app/components/Cta';
import Card from '@app/components/Card';
import Photos from '@app/components/Photos';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Loader from '@app/components/Loader';
import SendMessageButton from '@app/components/SendMessageButton';
import Button from '@app/components/Button';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import { IChat } from '@app/pages/NewChatPage/hooks';
import UserForumActivity, {
  getUserForumAnswers,
  getUserForumQuestions,
} from '@app/features/forum/components/UserForumActivity';
import { useQuestionDetails, useQuestions } from '@app/features/forum/hooks/useForum';
import ProfileSharePanel from '@app/components/ProfileSharePanel';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';

const getChatWithUser = (userChats: IChat[] | undefined, userId: string | undefined) => {
  if (!userId) return undefined;

  return userChats?.find((chat) => chat.Users[0]?.id === Number(userId));
};

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
    share: 'Podijeli profil',
    photos: 'Fotografije',
    questions: 'Pitanja',
    answers: 'Odgovori',
  };

  return labels[tabId] ?? tabId;
};

const isNumericProfileIdentifier = (value: string | undefined) =>
  Boolean(value && /^\d+$/.test(value));

const ProfileNotFoundState = ({
  onBack,
  onBrowseUsers,
}: {
  onBack: () => void;
  onBrowseUsers: () => void;
}) => (
  <AppLayout>
    <section className="mx-auto flex min-h-[calc(100vh-18rem)] max-w-2xl items-center justify-center rounded-3xl border border-[#dce4ff] bg-white px-6 py-12 text-center shadow-sm">
      <div className="flex max-w-lg flex-col items-center">
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl border border-[#dce4ff] bg-[#f7f9ff] text-blue-dark shadow-sm">
          <BiUserX size={34} />
        </div>
        <span className="mb-4 rounded-full border border-[#dce4ff] bg-[#f7f9ff] px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-dark">
          Profil nije dostupan
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
          Ne možemo pronaći profil.
        </h1>
        <p className="mt-3 text-sm leading-7 text-gray-600">
          Link je možda promijenjen, profil više ne postoji ili trenutno nije dostupan. Možeš se
          vratiti natrag ili pregledati sve dostupne korisnike.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button
            type="blue"
            className="rounded-full px-6 py-3 font-semibold shadow-md shadow-blue/15"
            onClick={onBack}
          >
            Natrag
          </Button>
          <Button
            type="secondary"
            className="rounded-full border border-[#dce4ff] px-6 py-3 font-semibold"
            onClick={onBrowseUsers}
          >
            Pregledaj korisnike
          </Button>
        </div>
      </div>
    </section>
  </AppLayout>
);

const OtherUserPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userId } = useParams();
  const isLegacyNumericProfileUrl = isNumericProfileIdentifier(userId);
  const { user: currentUser, isUserLoading: isCurrentUserLoading } = useGetCurrentUser();
  const isOwnPublicProfile =
    Boolean(currentUser?.data?.publicId) && currentUser?.data?.publicId === userId;
  const { user: otherUser, isUserLoading } = useGetUserById(
    !isLegacyNumericProfileUrl && !isOwnPublicProfile ? (userId as string) : ''
  );
  const profileUserData = isOwnPublicProfile ? currentUser?.data : otherUser?.data;
  const otherUserInternalId = profileUserData?.id;
  const isProfileLoading = isOwnPublicProfile ? isCurrentUserLoading : isUserLoading;
  const { allImages, allImagesLoading } = useGetAllImages(
    otherUserInternalId !== undefined ? String(otherUserInternalId) : ''
  );
  const { userChats } = useGetAllUserChats();
  const existingChat = getChatWithUser(
    userChats?.data,
    otherUserInternalId !== undefined ? String(otherUserInternalId) : userId
  );
  const {
    data: forumData,
    isError: isForumError,
    isPending: isForumLoading,
  } = useQuestions({ page: 1, limit: 100 });
  const numericUserId = Number(otherUserInternalId ?? userId);
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
  const isOwnSharedProfile =
    Number(currentUser?.data?.id) === Number(otherUserInternalId ?? userId) || isOwnPublicProfile;

  const profileTabs = [
    {
      id: 'general',
      tab: (
        <div className="flex items-center gap-2">
          Općenito <BiSolidFile fontSize={20} />
        </div>
      ),
      panel: (
        <div
          className={`mb-3 grid grid-cols-1 gap-5 ${
            isOwnSharedProfile ? '' : 'xl:grid-cols-[1fr_280px]'
          }`}
        >
          <div className="min-w-0">
            <UserProfileCard
              user={profileUserData}
              allImages={profileImages}
              allImagesLoading={allImagesLoading}
            />
          </div>

          {!isOwnSharedProfile && (
            <aside className="grid content-start items-start gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Cta subtitle="Pošalji poruku ovoj osobici." title="Pošalji poruku!">
                <SendMessageButton
                  sendMessageToId={String(otherUserInternalId ?? userId)}
                  sendMessageToPublicId={profileUserData?.publicId}
                  buttonType="blue"
                  buttonClasses="w-full rounded-full py-3 font-semibold shadow-md shadow-blue/15"
                  hasChatWithUser={Boolean(existingChat)}
                  existingChatId={existingChat?.id}
                />
              </Cta>
              <div className="rounded-3xl border border-red/20 bg-red/10 p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red shadow-sm">
                  <BiFlag size={22} />
                </div>
                <h2 className="text-xl font-bold text-gray-950">Postoji li problem?</h2>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  Ako primijetiš uznemiravanje, lažan profil ili drugi sigurnosni problem, prijavi
                  ga administratorima.
                </p>
                <Button
                  type="danger"
                  className="mt-5 rounded-full border border-red/30 bg-white px-5 py-3 font-semibold text-red transition-colors hover:bg-red hover:text-white"
                  onClick={() => navigate('/report/')}
                >
                  Prijavi problem
                </Button>
              </div>
            </aside>
          )}
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
          userId={otherUserInternalId}
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
          userId={otherUserInternalId}
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
        userId={otherUserInternalId ?? userId}
        publicId={profileUserData?.publicId}
        username={profileUserData?.username}
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

  if (!userId || isLegacyNumericProfileUrl) {
    return (
      <ProfileNotFoundState onBack={() => navigate(-1)} onBrowseUsers={() => navigate('/users')} />
    );
  }

  if (isProfileLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  if (!profileUserData) {
    return (
      <ProfileNotFoundState onBack={() => navigate(-1)} onBrowseUsers={() => navigate('/users')} />
    );
  }

  return (
    <AppLayout>
      <div data-testid="other-profile-page">
        <Tabs
          selectedIndex={selectedTabIndex}
          onSelect={handleTabSelect}
          selectedTabClassName={selectedTabClassName}
        >
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profileUserData?.username}</h1>
            </div>

            <label className="block lg:hidden">
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

            <TabList className="hidden w-full max-w-full flex-nowrap gap-2 overflow-x-auto rounded-2xl border border-[#dce4ff] bg-white p-2 shadow-sm lg:flex lg:w-auto lg:flex-wrap">
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
      </div>
    </AppLayout>
  );
};

export default OtherUserPage;
