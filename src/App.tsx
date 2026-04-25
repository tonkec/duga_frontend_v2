import './App.css';
import AppLayout from './components/AppLayout';
import UserCard, { IUser } from './components/UserCard';
import UserFilters from './components/UserFilters';
import { useState } from 'react';
import Paginated from './components/Paginated';
import { useGetAllUsers } from './hooks/useGetAllUsers';
import { useNavigate } from 'react-router';
import Loader from './components/Loader';
import { useGetWindowSize } from './hooks/useGetWindowSize';
import Cta from './components/Cta';
import LatestUploads from './components/LatestUploads';
import { useEnsureBackendUser } from './hooks/useEnsureBackendUser';

function App() {
  const { data: currentUser, isLoading: isUserLoading } = useEnsureBackendUser();
  const windowSize = useGetWindowSize();
  const navigate = useNavigate();
  const { allUsers, isAllUsersLoading } = useGetAllUsers();
  const [search, setSearch] = useState('');
  const [selectValue, setSelectValue] = useState({
    value: '',
    label: '',
  });

  if (isAllUsersLoading || isUserLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  const allUsersWithoutCurrentUser = allUsers?.data?.filter(
    (user: IUser) => user.id !== currentUser?.id
  );

  const allVerifiedUsers = allUsersWithoutCurrentUser?.filter((user: IUser) => user.isVerified);

  const filteredUsers = allVerifiedUsers?.filter((user: IUser) => {
    const value = search.toLowerCase();
    if (selectValue.value === 'username') return user?.username?.toLowerCase().includes(value);
    if (selectValue.value === 'gender') return user?.gender?.toLowerCase().includes(value);
    if (selectValue.value === 'sexuality') return user?.sexuality?.toLowerCase().includes(value);
    if (selectValue.value === 'location') return user?.location?.toLowerCase().includes(value);
    return false;
  });

  const renderedUsers = search ? filteredUsers : allVerifiedUsers;
  const itemsPerPage = windowSize.width < 1024 ? 4 : 8;

  return (
    <AppLayout>
      <UserFilters
        selectValue={selectValue}
        setSelectValue={setSelectValue}
        search={search}
        setSearch={setSearch}
      />

      <div className="mt-4">
        {!renderedUsers?.length && (
          <div className="text-center text-lg max-w-md mx-auto mt-12">
            <h2 className="mb-4">Nema korisnika 😢</h2>
          </div>
        )}

        <Paginated<IUser>
          gridClassName="grid xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          data={renderedUsers}
          itemsPerPage={itemsPerPage}
          paginatedSingle={({ singleEntry }: { singleEntry: IUser }) => {
            return (
              <UserCard
                user={singleEntry}
                onButtonClick={() => navigate(`/user/${singleEntry.id}`)}
                isOnline={singleEntry.status === 'online'}
              />
            );
          }}
        />
      </div>

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
          buttonText="Javi nam se"
          subtitle="Pomozi nam da održimo ovu platformu besplatnom i sigurnom za sve korisnike 🙏"
          onClick={() =>
            window.open(
              'https://github.com/tonkec/duga_frontend_v2?tab=readme-ov-file#contribution',
              '_blank'
            )
          }
        />
      </div>
    </AppLayout>
  );
}

export default App;
