import './App.css';
import AppLayout from './components/AppLayout';
import UserCard, { IUser } from './components/UserCard';
import { useGetAllUsers } from './hooks/useGetAllUsers';
import { useNavigate } from 'react-router';
import Loader from './components/Loader';
import Cta from './components/Cta';
import LatestUploads from './components/LatestUploads';
import { useEnsureBackendUser } from './hooks/useEnsureBackendUser';
import Button from './components/Button';
import { getLastOnlineUsers, getVisibleVerifiedUsers } from './utils/userDirectory';
import { BiHeart, BiSearch, BiUserPlus } from 'react-icons/bi';

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
          Pogledaj sve korisnike
        </Button>
      </div>
    </div>
  </div>
);

function App() {
  const { data: currentUser, isLoading: isUserLoading } = useEnsureBackendUser();
  const navigate = useNavigate();
  const { allUsers, isAllUsersLoading } = useGetAllUsers();

  if (isAllUsersLoading || isUserLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  const visibleUsers = getVisibleVerifiedUsers(allUsers?.data, currentUser?.id);
  const lastOnlineUsers = getLastOnlineUsers(visibleUsers, 4);

  return (
    <AppLayout>
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">
              Zadnja aktivnost
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Zadnji online korisnici</h2>
          </div>
          <Button type="transparent" onClick={() => navigate('/users')}>
            Pogledaj sve korisnike
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

      <LatestUploads />

      <div className="grid xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
        <Cta
          className="flex-1"
          title="Unaprijedi svoj profil"
          buttonText="Izmijeni profil"
          subtitle="Napiši nešto o sebi, dodaj fotografije i pronađi osobu svog života odmah ✍️"
          onClick={() => navigate(`/edit`)}
        />

        <Cta
          className="flex-1"
          title="Nemaš poruka?"
          subtitle="Započni razgovor s nekim od korisnika i pronađi srodnu dušu za čavrljanje 💬"
          buttonText="Nova poruka"
          onClick={() => navigate(`/new-chat`)}
        />

        <Cta
          className="flex-1"
          title="Želiš li nam pomoći?"
          subtitle="Pomozi nam da održimo ovu platformu besplatnom i sigurnom za sve korisnike. Piši nam na admin@duga.chat 🙏"
        >
          <a
            className="block w-full rounded bg-blue px-4 py-2 text-center text-sm text-white transition-all duration-200 hover:bg-blue-dark"
            href="mailto:admin@duga.chat"
          >
            Javi nam se
          </a>
        </Cta>
      </div>
    </AppLayout>
  );
}

export default App;
