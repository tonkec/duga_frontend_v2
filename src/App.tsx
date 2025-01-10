import './App.css';
import AppLayout from './components/AppLayout';
import UserCard, { IUser } from './components/UserCard';
import UserFilters from './components/UserFilters';
import { useState } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useGetUserById } from './hooks/useGetUserById';
import Paginated from './components/Paginated';
import { useGetAllUsers } from './hooks/useGetAllUsers';
import { useNavigate } from 'react-router';
import Loader from './components/Loader';
import { useGetWindowSize } from './hooks/useGetWindowSize';
import SendMessageButton from './components/SendMessageButton';
import notFound from './assets/not_found.svg';
import Cta from './components/Cta';

function App() {
  const windowSize = useGetWindowSize();
  const navigate = useNavigate();
  const [userId] = useLocalStorage('userId');
  const { user: currentUser, isUserLoading } = useGetUserById(userId as string);
  const { allUsers, isAllUsersLoading } = useGetAllUsers();
  const [selectValue, setSelectValue] = useState({
    value: 'firstName',
    label: 'ime',
  });
  const [search, setSearch] = useState('');

  if (isAllUsersLoading || isUserLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  const allUsersWithoutCurrentUser = allUsers?.data?.filter(
    (user: IUser) => user.id !== currentUser?.data.id
  );

  const filteredUsers = allUsersWithoutCurrentUser?.filter((user: IUser) => {
    if (selectValue.value === 'firstName') {
      return user.firstName.toLowerCase().includes(search.toLowerCase());
    }

    if (selectValue.value === 'gender') {
      if (user.gender) {
        return user.gender.toLowerCase().includes(search.toLowerCase());
      }
    }

    if (selectValue.value === 'sexuality') {
      if (user.sexuality) {
        return user.sexuality.toLowerCase().includes(search.toLowerCase());
      }
    }

    if (selectValue.value === 'location') {
      if (user.location) {
        return user.location.toLowerCase().includes(search.toLowerCase());
      }
    }
  });

  const renderedUsers = search ? filteredUsers : allUsersWithoutCurrentUser;

  const itemsPerPage = windowSize.width < 1024 ? 2 : 3;

  return (
    <AppLayout>
      <UserFilters
        selectValue={selectValue}
        setSelectValue={setSelectValue}
        search={search}
        setSearch={setSearch}
      />

      <div className="grid lg:grid-cols-3 gap-4 content-center">
        <div className="col-span-2">
          {!renderedUsers?.length && (
            <div className="text-center text-lg mt-4 max-w-md mx-auto mt-12">
              <img src={notFound} alt="No users found" className="mx-auto" />
            </div>
          )}
          <Paginated<IUser>
            gridClassName="grid xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data={renderedUsers}
            itemsPerPage={itemsPerPage}
            paginatedSingle={({ singleEntry }: { singleEntry: IUser }) => (
              <UserCard
                user={singleEntry}
                onButtonClick={() => {
                  navigate(`/user/${singleEntry.id}`);
                }}
                buttonText="Pogledaj profil 👀"
                secondButton={
                  <SendMessageButton sendMessageToId={singleEntry.id} buttonType="blue" />
                }
              />
            )}
          />
        </div>

        <div className="col-span-1">
          <Cta
            title="Dovrši svoj profil"
            buttonText="Izmijeni profil"
            subtitle="Napiši nešto o sebi, dodaj fotografije i pronađi osobu svog života ✍️"
            className="mb-4 mt-4"
          />

          <Cta
            title="Želiš li nam pomoći?"
            buttonText="Javi nam se"
            subtitle="Pomozi nam da održimo ovu platformu besplatnom i sigurnom za sve korisnike 🙏"
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default App;
