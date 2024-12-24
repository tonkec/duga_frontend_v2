import { useQuery } from '@tanstack/react-query';
import './App.css';
import AppLayout from './components/AppLayout';
import { getAllUsers } from './api/users';
import UserCard, { User } from './components/UserCard';
import UserFilters from './components/UserFilters';

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

  if (isAllUsersLoading) {
    return <AppLayout>Loading...</AppLayout>;
  }

  return (
    <AppLayout>
      <UserFilters />
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {allUsers?.data.map((user: User) => <UserCard key={user.id} user={user} />)}
      </ul>
    </AppLayout>
  );
}

export default App;
