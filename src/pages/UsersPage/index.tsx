import AppLayout from '@app/components/AppLayout';
import { getProfilePhoto } from '@app/api/uploads';
import Loader from '@app/components/Loader';
import Paginated from '@app/components/Paginated';
import UserCard, { IUser } from '@app/components/UserCard';
import UserFilters from '@app/components/UserFilters';
import { useEnsureBackendUser } from '@app/hooks/useEnsureBackendUser';
import { useGetAllUsers } from '@app/hooks/useGetAllUsers';
import { useGetWindowSize } from '@app/hooks/useGetWindowSize';
import { filterUsers, getVisibleVerifiedUsers } from '@app/utils/userDirectory';
import { useQueries } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BiGroup, BiSearch } from 'react-icons/bi';
import { getUserProfilePath } from '@app/utils/userProfilePath';

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
  const [showOnlyWithProfilePhoto, setShowOnlyWithProfilePhoto] = useState(false);
  const visibleUsers = useMemo(
    () => getVisibleVerifiedUsers(allUsers?.data, currentUser?.id),
    [allUsers?.data, currentUser?.id]
  );
  const profilePhotoQueries = useQueries({
    queries: showOnlyWithProfilePhoto
      ? visibleUsers.map((user) => ({
          queryKey: ['profilePhoto', String(user.id)],
          queryFn: () => getProfilePhoto(String(user.id)),
          staleTime: 1000 * 60 * 5,
          refetchOnMount: false,
          retry: false,
          throwOnError: false,
        }))
      : [],
  });
  const userIdsWithProfilePhoto = useMemo(
    () =>
      new Set(
        profilePhotoQueries
          .map((query, index) => (query.data?.data?.securePhotoUrl ? visibleUsers[index].id : null))
          .filter((userId): userId is number => userId !== null)
      ),
    [profilePhotoQueries, visibleUsers]
  );
  const isProfilePhotoFilterLoading =
    showOnlyWithProfilePhoto && profilePhotoQueries.some((query) => query.isPending);
  const renderUserCard = useCallback(
    ({ singleEntry }: { singleEntry: IUser }) => (
      <UserCard
        user={singleEntry}
        onButtonClick={() => navigate(getUserProfilePath(singleEntry))}
        isOnline={singleEntry.status === 'online'}
      />
    ),
    [navigate]
  );

  if (isAllUsersLoading || isUserLoading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    );
  }

  const filteredUsers = filterUsers(visibleUsers, search, selectValue);
  const renderedUsers = showOnlyWithProfilePhoto
    ? filteredUsers.filter((user) => userIdsWithProfilePhoto.has(user.id))
    : filteredUsers;
  const hasVisibleUsers = visibleUsers.length > 0;
  const itemsPerPage = windowSize.width < 1024 ? 4 : 8;

  return (
    <AppLayout>
      {hasVisibleUsers && (
        <>
          <UserFilters
            selectValue={selectValue}
            setSelectValue={setSelectValue}
            search={search}
            setSearch={setSearch}
          />

          <div className="mt-4 rounded-3xl border border-[#dce4ff] bg-white px-4 py-3 shadow-sm">
            <label className="flex w-fit cursor-pointer items-center gap-3 text-sm font-semibold text-gray-800">
              <input
                type="checkbox"
                checked={showOnlyWithProfilePhoto}
                onChange={(event) => setShowOnlyWithProfilePhoto(event.target.checked)}
                className="h-4 w-4 accent-blue"
              />
              Prikaži samo korisnike s profilnom
            </label>
          </div>
        </>
      )}

      <div className="mt-4">
        {isProfilePhotoFilterLoading && (
          <p className="mb-3 text-sm font-medium text-gray-500">Provjeravam profilne slike...</p>
        )}
        {!renderedUsers.length && (
          <section className="mx-auto mt-8 max-w-2xl rounded-3xl border border-dashed border-[#b9c6ff] bg-white px-6 py-10 text-center shadow-sm">
            <div className="mx-auto flex max-w-md flex-col items-center">
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
          paginatedSingle={renderUserCard}
        />
      </div>
    </AppLayout>
  );
};

export default UsersPage;
