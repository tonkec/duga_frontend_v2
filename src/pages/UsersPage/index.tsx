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
import { BiGroup, BiSearch } from 'react-icons/bi';

const defaultSelectValue = {
  value: 'username',
  label: 'Ime',
};

const UsersPage = () => {
  const { data: currentUser, isLoading: isUserLoading } = useEnsureBackendUser();
  const { allUsers, isAllUsersLoading } = useGetAllUsers();
  const windowSize = useGetWindowSize();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectValue, setSelectValue] = useState(defaultSelectValue);

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
          <section className="relative isolate mx-auto mt-8 max-w-2xl overflow-hidden rounded-3xl border border-dashed border-[#b9c6ff] bg-gradient-to-br from-white via-[#fbfcff] to-[#eef3ff] px-6 py-10 text-center shadow-sm">
            <div className="pointer-events-none absolute -left-16 top-8 h-36 w-36 rounded-full bg-blue/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-2 h-40 w-40 rounded-full bg-blue/10 blur-3xl" />

            <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
              <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-white text-blue shadow-lg shadow-blue/10">
                {search.trim() ? <BiSearch size={34} /> : <BiGroup size={34} />}
              </div>
              <span className="mb-3 rounded-full bg-blue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-dark">
                Nema rezultata
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                {search.trim() ? 'Nema korisnika za ovaj upit' : 'Nema dostupnih korisnika'}
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                {search.trim()
                  ? `Nismo pronašli nikoga za "${search}" prema kriteriju ${selectValue.label.toLowerCase()}. Pokušaj s kraćim pojmom ili drugim kriterijem.`
                  : 'Trenutno nema drugih verificiranih profila za prikaz. Navrati ponovno kasnije.'}
              </p>
              {search.trim() && (
                <button
                  type="button"
                  className="mt-6 rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue/15 transition-colors hover:bg-blue-dark"
                  onClick={() => {
                    setSelectValue(defaultSelectValue);
                    setSearch('');
                  }}
                >
                  Očisti pretragu
                </button>
              )}
            </div>
          </section>
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
