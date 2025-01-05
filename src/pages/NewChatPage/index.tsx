import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Input from '../../components/Input';
import { useGetAllUsers } from '../../hooks/useGetAllUsers';
import UserCard, { IUser } from '../../components/UserCard';

const NewChatPage = () => {
  const [search, setSearch] = useState('');

  const { allUsers, isAllUsersLoading } = useGetAllUsers();

  if (isAllUsersLoading) {
    return <AppLayout>Loading...</AppLayout>;
  }

  const filteredUsers = search
    ? allUsers?.data.filter(
        (user: IUser) =>
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase())
      )
    : [];

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
              onButtonClick={() => {
                console.log('clicked');
              }}
              buttonText="Pošalji poruku"
            />
          );
        })}
      </div>
    </AppLayout>
  );
};

export default NewChatPage;
