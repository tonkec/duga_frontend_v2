import './App.css';
import AppLayout from './components/AppLayout';
import UserCard, { IUser } from './components/UserCard';
import { useGetAllUsers } from './hooks/useGetAllUsers';
import { useNavigate } from 'react-router';
import Loader from './components/Loader';
import Cta from './components/Cta';
import LatestUploads from './components/LatestUploads';
import LatestComments from './components/LatestComments';
import { useEnsureBackendUser } from './hooks/useEnsureBackendUser';
import { useGetAllUserChats } from './hooks/useGetAllUserChats';
import Button from './components/Button';
import { getLastOnlineUsers, getVisibleVerifiedUsers } from './utils/userDirectory';
import { BiHeart, BiMessageRoundedDots, BiSearch, BiUserPlus } from 'react-icons/bi';
import { useQuestion, useQuestions } from './features/forum/hooks/useForum';
import type { Question } from './features/forum/types/forum.types';
import { getVoteScore } from './features/forum/components/VoteControls';
import RecordCreatedAt from './components/RecordCreatedAt';

interface WelcomeHeroProps {
  onEditProfile: () => void;
  onFindUsers: () => void;
  onSendMessage: () => void;
}

const WelcomeHero = ({ onEditProfile, onFindUsers, onSendMessage }: WelcomeHeroProps) => (
  <section className="relative isolate mb-10 overflow-hidden rounded-3xl bg-blue px-5 py-8 text-white shadow-xl shadow-blue/20 sm:px-8 lg:px-10">
    <div className="absolute -left-20 top-4 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-pink/20 blur-3xl" />

    <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
      <div className="max-w-3xl">
        <span className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          Prvi korak
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Dobrodošao_la. Kreni od profila.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
          Dodaj par detalja i profilnu fotografiju kako bi drugi odmah znali tko si. Nakon toga
          možeš pregledati ljudeke ili otvoriti razgovore.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="secondary"
            className="rounded-full px-6 py-3 font-bold shadow-lg shadow-black/10"
            onClick={onEditProfile}
          >
            Uredi profil
          </Button>
          <Button
            type="transparent"
            className="rounded-full px-6 py-3 font-semibold text-white hover:bg-white/15 hover:text-white"
            onClick={onFindUsers}
          >
            Preskoči na ljudeke
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/15 bg-white/95 p-4 text-gray-950 shadow-lg shadow-black/10">
        <p className="mb-3 text-sm font-bold text-gray-900">Što sad?</p>
        <button
          type="button"
          onClick={onEditProfile}
          className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-[#f0f4ff]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue text-sm font-bold text-white">
            1
          </span>
          <span>
            <span className="block text-sm font-bold">Uredi profil</span>
            <span className="mt-1 block text-xs leading-5 text-gray-500">
              Dodaj sliku, lokaciju i kratki opis.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onFindUsers}
          className="mt-1 flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-[#f0f4ff]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue/10 text-sm font-bold text-blue">
            2
          </span>
          <span>
            <span className="block text-sm font-bold">Pogledaj ljudeke</span>
            <span className="mt-1 block text-xs leading-5 text-gray-500">
              Pronađi nekoga tko ti je zanimljiv.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onSendMessage}
          className="mt-1 flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-[#f0f4ff]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pink/10 text-sm font-bold text-pink">
            3
          </span>
          <span>
            <span className="block text-sm font-bold">Pošalji poruku</span>
            <span className="mt-1 block text-xs leading-5 text-gray-500">
              Razgovor može krenuti običnim bok.
            </span>
          </span>
        </button>
      </div>
    </div>
  </section>
);

const CommunityTips = () => (
  <section className="mb-10">
    <div className="mb-4 flex flex-col gap-1">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">Savjeti</p>
      <h2 className="text-2xl font-bold text-gray-900">Kako započeti bolje upoznavanje</h2>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <article className="rounded-3xl border border-[#dce4ff] bg-white px-5 py-5 shadow-sm">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue/10 text-blue">
          <BiUserPlus size={24} />
        </div>
        <h3 className="text-base font-bold text-gray-950">Dodaj jasnu profilnu sliku</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Profil s jasnom fotografijom djeluje pristupačnije i lakše započinje razgovore.
        </p>
      </article>

      <article className="rounded-3xl border border-[#dce4ff] bg-white px-5 py-5 shadow-sm">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-pink/10 text-pink">
          <BiHeart size={24} />
        </div>
        <h3 className="text-base font-bold text-gray-950">Napiši nešto osobno</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Kratak opis interesa, hobija ili vrijednosti pomaže drugima da te bolje upoznaju.
        </p>
      </article>

      <article className="rounded-3xl border border-[#dce4ff] bg-white px-5 py-5 shadow-sm">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue/10 text-blue-dark">
          <BiMessageRoundedDots size={24} />
        </div>
        <h3 className="text-base font-bold text-gray-950">Počni razgovor jednostavnim pitanjem</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Pitaj nešto lagano i konkretno, poput omiljene pjesme, filma ili plana za vikend.
        </p>
      </article>
    </div>
  </section>
);

type ChatWithMessages = {
  Messages?: unknown[] | null;
};

type UserWithCreatedAt = {
  createdAt?: string | null;
};

const WELCOME_HERO_VISIBLE_DAYS = 3;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const isWithinWelcomePeriod = (user: UserWithCreatedAt | undefined) => {
  if (!user?.createdAt) return false;

  const createdAtTime = new Date(user.createdAt).getTime();
  if (Number.isNaN(createdAtTime)) return false;

  const elapsedTime = Date.now() - createdAtTime;
  return elapsedTime >= 0 && elapsedTime <= WELCOME_HERO_VISIBLE_DAYS * DAY_IN_MS;
};

interface EmptyHomepageUsersProps {
  onEditProfile: () => void;
  onBrowseUsers: () => void;
}

const EmptyHomepageUsers = ({ onEditProfile, onBrowseUsers }: EmptyHomepageUsersProps) => (
  <div className="relative isolate mx-auto mt-6 overflow-hidden rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-[#f7f9ff] via-white to-[#eef3ff] px-5 py-10 text-center shadow-sm sm:px-8">
    <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-blue/10 blur-3xl" />
    <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-pink/10 blur-3xl" />

    <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
      <div className="mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-white text-blue-dark shadow-lg shadow-blue/10">
        <BiUserPlus size={40} />
      </div>

      <span className="mb-3 rounded-full bg-blue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-dark">
        Zajednica
      </span>
      <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
        Još nema korisnika
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
        Trenutno nema profila za prikaz. Uredi svoj profil i provjeri kasnije kada se pojave novi
        verificirani korisnici.
      </p>

      <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e8eeff] bg-white/80 px-4 py-4 text-left shadow-sm">
          <BiSearch className="mb-2 text-blue" size={22} />
          <h3 className="text-sm font-bold text-gray-950">Pretraživanje</h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">Novi profili pojavit će se ovdje.</p>
        </div>
        <div className="rounded-2xl border border-[#e8eeff] bg-white/80 px-4 py-4 text-left shadow-sm">
          <BiHeart className="mb-2 text-pink" size={22} />
          <h3 className="text-sm font-bold text-gray-950">Duga zajednica</h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Prikazujemo samo verificirane osobe.
          </p>
        </div>
        <div className="rounded-2xl border border-[#e8eeff] bg-white/80 px-4 py-4 text-left shadow-sm">
          <BiUserPlus className="mb-2 text-blue-dark" size={22} />
          <h3 className="text-sm font-bold text-gray-950">Tvoj profil</h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Dodaj detalje da te drugi lakše upoznaju.
          </p>
        </div>
      </div>

      <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        <Button
          type="blue"
          className="rounded-full px-6 py-3 font-semibold shadow-lg shadow-blue/20"
          onClick={onEditProfile}
        >
          Uredi profil
        </Button>
        <Button
          type="secondary"
          className="rounded-full border border-[#dce4ff] px-6 py-3"
          onClick={onBrowseUsers}
        >
          Pogledaj sve ljudeke
        </Button>
      </div>
    </div>
  </div>
);

const getQuestionAnswerCount = (question: Question) =>
  Math.max(question.answerCount ?? 0, question.Answers?.length ?? 0);

const getQuestionAuthorName = (question: Question) =>
  question.User?.name || question.User?.username || 'Korisnik';

const getLatestQuestion = (questions: Question[]) => {
  return [...questions].sort(
    (firstQuestion, secondQuestion) =>
      new Date(secondQuestion.createdAt).getTime() - new Date(firstQuestion.createdAt).getTime()
  )[0];
};

const LatestForumQuestion = ({ onOpenQuestion, onAskQuestion }: {
  onOpenQuestion: (questionId: number) => void;
  onAskQuestion: () => void;
}) => {
  const questionsQuery = useQuestions({ page: 1, limit: 10 });
  const latestQuestionFromList = getLatestQuestion(questionsQuery.data?.data ?? []);
  const questionQuery = useQuestion(latestQuestionFromList?.id);
  const latestQuestion = questionQuery.data ?? latestQuestionFromList;

  if (questionsQuery.isPending) {
    return (
      <section className="mt-12 rounded-3xl border border-[#dce4ff] bg-white py-10 shadow-sm">
        <Loader variant="inline" label="Učitavanje zadnjeg pitanja..." />
      </section>
    );
  }

  if (!latestQuestion) {
    return (
      <section className="mt-12 rounded-3xl border border-[#dce4ff] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">Forum</p>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">Još nema pitanja</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Budi prvi_a koji_a će otvoriti temu na forumu.
        </p>
        <Button type="blue" className="mt-5 rounded-full px-6 py-3" onClick={onAskQuestion}>
          Postavi pitanje
        </Button>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">Forum</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">Zadnje pitanje s foruma</h2>
        </div>
        <Button type="transparent" onClick={() => onOpenQuestion(latestQuestion.id)}>
          Otvori pitanje
        </Button>
      </div>

      <article
        role="button"
        tabIndex={0}
        onClick={() => onOpenQuestion(latestQuestion.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onOpenQuestion(latestQuestion.id);
          }
        }}
        className="cursor-pointer rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-gray-950">{latestQuestion.title}</h3>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-500">
              <span>
                Autor:{' '}
                <span className="font-semibold text-blue">
                  {getQuestionAuthorName(latestQuestion)}
                </span>
              </span>
              <RecordCreatedAt
                createdAt={latestQuestion.createdAt}
                className="!text-xs !text-gray-500"
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="rounded-full border border-[#dce4ff] bg-[#f7f9ff] px-4 py-2 text-sm font-semibold text-blue-dark">
              {getQuestionAnswerCount(latestQuestion)} odgovora
            </span>
            <span className="rounded-full border border-[#dce4ff] bg-[#f7f9ff] px-4 py-2 text-sm font-semibold text-blue-dark">
              {getVoteScore(latestQuestion)} glasova
            </span>
          </div>
        </div>
      </article>
    </section>
  );
};

function App() {
  const { data: currentUser, isLoading: isUserLoading } = useEnsureBackendUser();
  const navigate = useNavigate();
  const { allUsers, isAllUsersLoading } = useGetAllUsers();
  const { userChats, isUserChatsLoading } = useGetAllUserChats();

  if (isAllUsersLoading || isUserLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  const visibleUsers = getVisibleVerifiedUsers(allUsers?.data, currentUser?.id);
  const lastOnlineUsers = getLastOnlineUsers(visibleUsers, 4);
  const messageCount =
    userChats?.data?.reduce(
      (total: number, chat: ChatWithMessages) => total + (chat.Messages?.length ?? 0),
      0
    ) ?? 0;
  const shouldShowWelcomeHero = isWithinWelcomePeriod(currentUser);
  const shouldShowCommunityTips =
    !shouldShowWelcomeHero && !isUserChatsLoading && messageCount === 0;

  return (
    <AppLayout>
      {shouldShowWelcomeHero && (
        <WelcomeHero
          onEditProfile={() => navigate('/edit')}
          onFindUsers={() => navigate('/users')}
          onSendMessage={() => navigate('/new-chat')}
        />
      )}

      {shouldShowCommunityTips && <CommunityTips />}

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">Ljudeki</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Ljudeki koje možeš upoznati</h2>
          </div>
          <Button type="transparent" onClick={() => navigate('/users')}>
            Pogledaj sve ljudeke
          </Button>
        </div>

        {!lastOnlineUsers.length && (
          <EmptyHomepageUsers
            onEditProfile={() => navigate('/edit')}
            onBrowseUsers={() => navigate('/users')}
          />
        )}

        {!!lastOnlineUsers.length && (
          <ul className="grid xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lastOnlineUsers.map((user: IUser) => (
              <li className="h-full" key={user.id}>
                <UserCard
                  user={user}
                  onButtonClick={() => navigate(`/user/${user.id}`)}
                  isOnline={user.status === 'online'}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <LatestForumQuestion
        onOpenQuestion={(questionId) => navigate(`/forum/questions/${questionId}`)}
        onAskQuestion={() => navigate('/forum/ask')}
      />

      <LatestUploads />

      <LatestComments />

      <section className="relative isolate mt-12 overflow-hidden rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-blue/10 via-white to-[#eef3ff] p-4 shadow-sm sm:p-5">
        <div className="pointer-events-none absolute -left-20 top-6 h-44 w-44 rounded-full bg-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-blue/10 blur-3xl" />
        <div className="relative z-10 mb-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">Brze akcije</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">Što želiš napraviti?</h2>
        </div>
        <div className="relative z-10 grid gap-4 sm:grid-cols-2">
        <Cta
          className="flex-1 !from-white !via-[#f7f9ff] !to-blue/10"
          title="Unaprijedi svoj profil"
          buttonText="Izmijeni profil"
          subtitle="Napiši nešto o sebi, dodaj fotografije i pronađi osobu svog života odmah ✍️"
          onClick={() => navigate(`/edit`)}
        />

        <Cta
          className="flex-1 !from-white !via-[#f7f9ff] !to-[#eef3ff]"
          title="Nemaš poruka?"
          subtitle="Započni razgovor s nekim od korisnika i pronađi srodnu dušu za čavrljanje 💬"
          buttonText="Nova poruka"
          onClick={() => navigate(`/new-chat`)}
        />

        <Cta
          className="flex-1 !from-white !via-[#f7f9ff] !to-blue/10"
          title="Imaš pitanje?"
          subtitle="Postavi pitanje na forumu i nađi odgovore od zajednice."
          buttonText="Postavi pitanje"
          onClick={() => navigate('/forum/ask')}
        />

        <Cta
          className="flex-1 !from-white !via-[#f7f9ff] !to-[#eef3ff]"
          title="Želiš li nam pomoći?"
          subtitle="Pomozi nam da održimo ovu platformu besplatnom i sigurnom za sve korisnike. Piši nam na admin@duga.chat 🙏"
        >
          <a
            className="block w-full rounded-full bg-blue px-4 py-3 text-center text-sm font-semibold text-white shadow-md shadow-blue/15 transition-all duration-200 hover:bg-blue-dark"
            href="mailto:admin@duga.chat"
          >
            Javi nam se
          </a>
        </Cta>
        </div>
      </section>
    </AppLayout>
  );
}

export default App;
