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
import Card from './components/Card';
import LatestUploads from './components/LatestUploads';

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

  const itemsPerPage = windowSize.width < 1024 ? 2 : 4;

  return (
    <AppLayout>
      <UserFilters
        selectValue={selectValue}
        setSelectValue={setSelectValue}
        search={search}
        setSearch={setSearch}
      />

      <div className="mt-12">
        {!renderedUsers?.length && (
          <div className="text-center text-lg mt-4 max-w-md mx-auto mt-12">
            <img src={notFound} alt="No users found" className="mx-auto" />
          </div>
        )}
        <Paginated<IUser>
          gridClassName="grid xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
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

      <div className="grid xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
        <div className="col-span-2">
          <h2 className="mb-2">💬 Zadnji komentari na fotografije</h2>
          <Card className="p-0 overflow-hidden">
            <div className="flex flex-col gap-1 border-b p-4 hover:bg-blue hover:text-white transition cursor-pointer">
              <p className="mt-2 mb-3">Antonija Simic</p>
              <p>
                Hej Lorem ipsum, dolor sit amet consectetur adipisicing elit. Excepturi, Lorem ipsum
                dolor sit amet consectetur, adipisicing elit. Neque, ipsum.
              </p>
              <p
                className="
            text-sm text-gray-500"
              >
                12:31pm
              </p>
            </div>
          </Card>
        </div>

        <div className="col-span-2">
          <h2 className="mb-2"> 📬 Tvoje nedavne poruke</h2>

          <Card className="p-0 overflow-hidden">
            <div className="flex flex-col gap-1 border-b p-4 hover:bg-blue hover:text-white transition cursor-pointer">
              <p className="mt-2 mb-3">Antonija Simic</p>
              <p>
                Hej Lorem ipsum, dolor sit amet consectetur adipisicing elit. Excepturi, Lorem ipsum
                dolor sit amet consectetur, adipisicing elit. Neque, ipsum.
              </p>
              <p
                className="
            text-sm text-gray-500"
              >
                12:31pm
              </p>
            </div>

            <div className="flex flex-col gap-1 border-b p-4 hover:bg-blue hover:text-white transition cursor-pointer">
              <p className="mt-2 mb-3">Antonija Simic</p>
              <p>
                Hej Lorem ipsum, dolor sit amet consectetur adipisicing elit. Excepturi, Lorem ipsum
                dolor sit amet consectetur, adipisicing elit. Neque, ipsum.
              </p>
              <p
                className="
            text-sm text-gray-500"
              >
                12:31pm
              </p>
            </div>

            <div className="flex flex-col gap-1 border-b p-4 hover:bg-blue hover:text-white transition cursor-pointer">
              <p className="mt-2 mb-3">Antonija Simic</p>
              <p>
                Hej Lorem ipsum, dolor sit amet consectetur adipisicing elit. Excepturi, Lorem ipsum
                dolor sit amet consectetur, adipisicing elit. Neque, ipsum.
              </p>
              <p
                className="
            text-sm text-gray-500"
              >
                12:31pm
              </p>
            </div>

            <div className="flex flex-col gap-1 border-b p-4 hover:bg-blue hover:text-white transition cursor-pointer">
              <p className="mt-2 mb-3">Antonija Simic</p>
              <p>
                Hej Lorem ipsum, dolor sit amet consectetur adipisicing elit. Excepturi, Lorem ipsum
                dolor sit amet consectetur, adipisicing elit. Neque, ipsum.
              </p>
              <p
                className="
            text-sm text-gray-500"
              >
                12:31pm
              </p>
            </div>
          </Card>
        </div>
      </div>

      <LatestUploads />

      <div className="flex justify-center gap-4 mt-12">
        <Cta
          className="flex-1"
          title="Dovrši svoj profil"
          buttonText="Izmijeni profil"
          subtitle="Napiši nešto o sebi, dodaj fotografije i pronađi osobu svog života odmah ✍️"
        />

        <Cta
          className="flex-1"
          title="Nemaš poruka?"
          subtitle="Započni razgovor s nekim od korisnika i pronađi srodnu dušu za čavrljanje 💬"
          buttonText="Nova poruka"
        />

        <Cta
          className="flex-1"
          title="Želiš li nam pomoći?"
          buttonText="Javi nam se"
          subtitle="Pomozi nam da održimo ovu platformu besplatnom i sigurnom za sve korisnike 🙏"
        />
      </div>
    </AppLayout>
  );
}

export default App;
