import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Input from '../../components/Input';
import { useGetAllUsers } from '../../hooks/useGetAllUsers';
import UserCard, { IUser } from '../../components/UserCard';
import { useCreateNewChat, useGetAllUserChats } from './hooks';
import { useLocalStorage } from '@uidotdev/usehooks';
import Loader from '../../components/Loader';

const NewChatPage = () => {
  const [currentUserId] = useLocalStorage('userId');
  const { userChats } = useGetAllUserChats(currentUserId as string);
  console.log(userChats);
  const [search, setSearch] = useState('');
  const { onCreateChat } = useCreateNewChat();
  const { allUsers, isAllUsersLoading } = useGetAllUsers();

  if (isAllUsersLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  const filteredUsers = search
    ? allUsers?.data.filter(
        (user: IUser) =>
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const onButtonClick = (partnerId: string) => {
    onCreateChat({ userId: currentUserId as string, partnerId });
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredUsers?.map((user: IUser) => {
          return (
            <UserCard
              key={user.id}
              user={user}
              onButtonClick={() => onButtonClick(user.id)}
              buttonText="Pošalji poruku"
            />
          );
        })}
      </div>
    </AppLayout>
  );
};

export default NewChatPage;
