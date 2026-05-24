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
          <div className="text-center text-lg max-w-md mx-auto mt-12">
            <h2 className="mb-4">Nema korisnika 😢</h2>
          </div>
        )}

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
