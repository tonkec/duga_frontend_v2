import { useQuery } from '@tanstack/react-query';
import './App.css';
import AppLayout from './components/AppLayout';
import { getAllUsers } from './api/users';
import UserCard, { IUser } from './components/UserCard';
import UserFilters from './components/UserFilters';
import { useState } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useGetUserById } from './hooks/useGetUserById';
import Paginated from './components/Paginated';
import TestSocketConnection from './TestSocketConnection';

const useGetAllUsers = () => {
  const {
    data: allUsers,
    error: allUsersError,
    isPending: isAllUsersLoading,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  return { allUsers, allUsersError, isAllUsersLoading };
};

function App() {
  const [userId] = useLocalStorage('userId');
  const { user: currentUser, isUserLoading } = useGetUserById(userId as string);
  const { allUsers, isAllUsersLoading } = useGetAllUsers();
  const [selectValue, setSelectValue] = useState({
    value: '',
    label: '',
  });
  const [search, setSearch] = useState('');

  if (isAllUsersLoading || isUserLoading) {
    return <AppLayout>Loading...</AppLayout>;
  }

  const allUsersWithCurrentUser = allUsers?.data.filter(
    (user: IUser) => user.id !== currentUser?.data.id
  );

  const filteredUsers = allUsersWithCurrentUser?.filter((user: IUser) => {
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

  const renderedUsers = search ? filteredUsers : allUsersWithCurrentUser;

  if (!renderedUsers) {
    return (
      <AppLayout>
        <h1>No users found</h1>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <TestSocketConnection />
      <UserFilters
        selectValue={selectValue}
        setSelectValue={setSelectValue}
        search={search}
        setSearch={setSearch}
      />
      <Paginated<IUser>
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        data={renderedUsers}
        paginatedSingle={({ singleEntry }: { singleEntry: IUser }) => (
          <UserCard user={singleEntry} />
        )}
      />
    </AppLayout>
  );
}

export default App;
