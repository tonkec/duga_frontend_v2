import { useQuery } from '@tanstack/react-query';
import './App.css';
import AppLayout from './components/AppLayout';
import { getAllUsers } from './api/users';
import UserCard, { User } from './components/UserCard';
import UserFilters from './components/UserFilters';
import { useState } from 'react';

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
  const { allUsers, isAllUsersLoading } = useGetAllUsers();
  const [selectValue, setSelectValue] = useState({
    value: '',
    label: '',
  });
  const [search, setSearch] = useState('');

  if (isAllUsersLoading) {
    return <AppLayout>Loading...</AppLayout>;
  }

  const filteredUsers = allUsers?.data.filter((user: User) => {
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

  const renderedUsers = search ? filteredUsers : allUsers?.data;

  return (
    <AppLayout>
      <UserFilters
        selectValue={selectValue}
        setSelectValue={setSelectValue}
        search={search}
        setSearch={setSearch}
      />
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {renderedUsers.map((user: User) => (
          <UserCard key={user.id} user={user} />
        ))}
      </ul>
    </AppLayout>
  );
}

export default App;
