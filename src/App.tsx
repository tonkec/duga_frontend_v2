import './App.css';
import AppLayout from './components/AppLayout';
import UserCard, { IUser } from './components/UserCard';
import UserFilters from './components/UserFilters';
import { useEffect, useRef, useState } from 'react';
import Paginated from './components/Paginated';
import { useGetAllUsers } from './hooks/useGetAllUsers';
import { useNavigate } from 'react-router';
import Loader from './components/Loader';
import { useGetWindowSize } from './hooks/useGetWindowSize';
import SendMessageButton from './components/SendMessageButton';
import Cta from './components/Cta';
import LatestUploads from './components/LatestUploads';
import LatestMessages from './components/LatestMessages';
import LatestComments from './components/LatestComments';
import { useCreateUser } from './pages/Login/hooks';
import { useAuth0 } from '@auth0/auth0-react';
import { useGetAllUserChats } from './hooks/useGetAllUserChats';
import { IChat } from '@app/pages/NewChatPage/hooks';
import { z } from 'zod';
import { useGetCurrentUser } from './hooks/useGetCurrentUser';

const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1),
  isVerified: z.boolean(),
  auth0Id: z.string().min(1),
});

const DEFAULT_USERNAME = 'Korisnik';

function App() {
  const hasBeenCalled = useRef(false);
  const { createOrLoginUser } = useCreateUser();
  const { user: auth0User } = useAuth0();
  const windowSize = useGetWindowSize();
  const navigate = useNavigate();
  const { user: currentUser, isUserLoading } = useGetCurrentUser();
  const { allUsers, isAllUsersLoading } = useGetAllUsers();
  const [search, setSearch] = useState('');

  const [selectValue, setSelectValue] = useState({
    value: 'username',
    label: 'ime',
  });

  const { userChats, isUserChatsLoading } = useGetAllUserChats(currentUser?.data.id as string);

  useEffect(() => {
    if (!auth0User || hasBeenCalled.current) return;

    const input = {
      email: auth0User.email,
      username: DEFAULT_USERNAME.toLowerCase(),
      isVerified: auth0User.email_verified,
      auth0Id: auth0User.sub,
    };

    const parsed = createUserSchema.safeParse(input);
    if (!parsed.success) {
      console.error('❌ Invalid user input', parsed.error.flatten());
      return;
    }

    createOrLoginUser(parsed.data);
    // This prevents calling createOrLoginUser twice
    hasBeenCalled.current = true;
  }, [auth0User, createOrLoginUser]);

  if (isAllUsersLoading || isUserLoading || isUserChatsLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  const allUsersWithoutCurrentUser = allUsers?.data?.filter(
    (user: IUser) => user.id !== currentUser?.data.id
  );

  const allVerifiedUsers = allUsersWithoutCurrentUser?.filter((user: IUser) => user.isVerified);

  const filteredUsers = allVerifiedUsers?.filter((user: IUser) => {
    if (selectValue.value === 'username') {
      return user?.username?.toLowerCase().includes(search.toLowerCase());
    }

    if (selectValue.value === 'gender') {
      return user?.gender?.toLowerCase().includes(search.toLowerCase());
    }

    if (selectValue.value === 'sexuality') {
      return user?.sexuality?.toLowerCase().includes(search.toLowerCase());
    }

    if (selectValue.value === 'location') {
      return user?.location?.toLowerCase().includes(search.toLowerCase());
    }

    return false;
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
          <div className="text-center text-lg max-w-md mx-auto mt-12">
            <h2 className="mb-4">Nema korisnika 😢</h2>
          </div>
        )}

        <Paginated<IUser>
          gridClassName="grid xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          data={renderedUsers}
          itemsPerPage={itemsPerPage}
          paginatedSingle={({ singleEntry }: { singleEntry: IUser }) => {
            const hasChatWithUser = userChats?.data?.some(
              (chat: IChat) =>
                chat.Users?.some((user) => user.id === Number(singleEntry.id)) &&
                chat.Messages?.length > 0
            );

            return (
              <UserCard
                user={singleEntry}
                onButtonClick={() => {
                  navigate(`/user/${singleEntry.id}`);
                }}
                buttonText="Pogledaj profil 👀"
                secondButton={
                  <SendMessageButton
                    sendMessageToId={singleEntry.id}
                    buttonType="blue"
                    disabled={hasChatWithUser}
                  />
                }
                isOnline={singleEntry.status === 'online'}
              />
            );
          }}
        />
      </div>

      <div className="grid xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
        <LatestComments />
        <LatestMessages />
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
