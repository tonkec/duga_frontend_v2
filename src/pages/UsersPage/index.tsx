import AppLayout from '@app/components/AppLayout';
import Loader from '@app/components/Loader';
import Paginated from '@app/components/Paginated';
import UserCard, { IUser } from '@app/components/UserCard';
import UserFilters from '@app/components/UserFilters';
import { useEnsureBackendUser } from '@app/hooks/useEnsureBackendUser';
import { useGetAllUsers } from '@app/hooks/useGetAllUsers';
import { useGetWindowSize } from '@app/hooks/useGetWindowSize';
import { filterUsers, getVisibleVerifiedUsers } from '@app/utils/userDirectory';
import { useState } from 'react';
import { useNavigate } from 'react-router';

const UsersPage = () => {
  const { data: currentUser, isLoading: isUserLoading } = useEnsureBackendUser();
  const { allUsers, isAllUsersLoading } = useGetAllUsers();
  const windowSize = useGetWindowSize();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectValue, setSelectValue] = useState({
    value: 'username',
    label: 'Ime',
  });

  if (isAllUsersLoading || isUserLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  const visibleUsers = getVisibleVerifiedUsers(allUsers?.data, currentUser?.id);
  const renderedUsers = filterUsers(visibleUsers, search, selectValue);
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
        {!renderedUsers.length && (
          <div className="text-center text-lg max-w-md mx-auto mt-12">
            <h2 className="mb-4">Nema korisnika 😢</h2>
          </div>
        )}

        <Paginated<IUser>
          gridClassName="grid xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          data={renderedUsers}
          itemsPerPage={itemsPerPage}
          getItemKey={(user) => user.id}
          paginatedSingle={({ singleEntry }: { singleEntry: IUser }) => (
            <UserCard
              user={singleEntry}
              onButtonClick={() => navigate(`/user/${singleEntry.id}`)}
              isOnline={singleEntry.status === 'online'}
            />
          )}
        />
      </div>
    </AppLayout>
  );
};

export default UsersPage;
