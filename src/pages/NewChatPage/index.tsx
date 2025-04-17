import { useState } from 'react';
import AppLayout from '@app/components/AppLayout';
import Input from '@app/components/Input';
import { useGetAllUsers } from '@app/hooks/useGetAllUsers';
import UserCard, { IUser } from '@app/components/UserCard';
import { useCreateNewChat } from './hooks';
import { useLocalStorage } from '@uidotdev/usehooks';
import Loader from '@app/components/Loader';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import AllUserChats from './components/AllUserChats';

const NewChatPage = () => {
  const [currentUserId] = useLocalStorage('userId');
  const { userChats, isUserChatsLoading } = useGetAllUserChats(currentUserId as string);
  const [search, setSearch] = useState('');
  const { onCreateChat } = useCreateNewChat();
  const { allUsers, isAllUsersLoading } = useGetAllUsers();

  if (isAllUsersLoading || isUserChatsLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  const verifiedUsers = allUsers?.data.filter((user: IUser) => user.isVerified);

  const filteredUsers = search
    ? verifiedUsers
        .filter((user: IUser) => {
          return (
            user?.username?.toLowerCase().includes(search.toLowerCase()) ||
            user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            user?.lastName?.toLowerCase().includes(search.toLowerCase())
          );
        })
        .filter((user: IUser) => user.id !== currentUserId)
    : [];

  const onButtonClick = (partnerId: number) => {
    onCreateChat({ userId: Number(currentUserId), partnerId });
  };

  return (
    <AppLayout>
      <h1>Pretraži prema imenu ili prezimenu</h1>
      <Input
        type="text"
        placeholder="Upiši ime ili prezime"
        className="mt-4"
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
        {filteredUsers?.map((user: IUser) => {
          return (
            <UserCard
              key={user.id}
              user={user}
              onButtonClick={() => onButtonClick(Number(user.id))}
              buttonText="Pošalji poruku"
            />
          );
        })}
      </div>
      {userChats?.data.length > 0 && <AllUserChats userChats={userChats?.data} />}
    </AppLayout>
  );
};

export default NewChatPage;
