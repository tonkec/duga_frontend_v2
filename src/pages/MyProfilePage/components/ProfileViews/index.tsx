import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BiChevronLeft, BiChevronRight, BiShow } from 'react-icons/bi';
import Loader from '@app/components/Loader';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import UserAvatar from '@app/components/UserAvatar';
import { useGetProfileViews } from '@app/hooks/useGetProfileViews';
import { getUserProfilePath } from '@app/utils/userProfilePath';

const PROFILE_VIEWS_FETCH_LIMIT = 10;
const PROFILE_VIEWS_PER_PAGE = 5;

const ProfileViews = () => {
  const [page, setPage] = useState(1);
  const { profileViews, areProfileViewsLoading } = useGetProfileViews({
    page: 1,
    limit: PROFILE_VIEWS_FETCH_LIMIT,
  });
  const latestViews = profileViews?.data.data.slice(0, PROFILE_VIEWS_FETCH_LIMIT) ?? [];
  const pagination = profileViews?.data.pagination;
  const displayedTotal = latestViews.length;
  const totalPages = Math.max(Math.ceil(displayedTotal / PROFILE_VIEWS_PER_PAGE), 1);
  const views = latestViews.slice(
    (page - 1) * PROFILE_VIEWS_PER_PAGE,
    page * PROFILE_VIEWS_PER_PAGE
  );

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  if (areProfileViewsLoading) {
    return (
      <div className="rounded-2xl border border-[#dce4ff] bg-white py-8">
        <Loader variant="inline" label="Učitavanje pregleda profila..." />
      </div>
    );
  }

  if (!views.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[#dce4ff] bg-white p-8 text-center">
        <div className="profile-views-empty-icon mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blue/10 text-blue">
          <BiShow size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-950">Još nema pregleda profila</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Ovdje će se prikazati osobe koje su pogledale tvoj profil.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-[#dce4ff] bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">Pregledi</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-950">Tko je pogledao profil</h2>
        </div>
        {pagination && (
          <span className="w-fit rounded-full border border-[#dce4ff] bg-[#f7f9ff] px-4 py-2 text-sm font-semibold text-gray-700">
            Zadnjih {displayedTotal} {displayedTotal === 1 ? 'pregled' : 'pregleda'}
          </span>
        )}
      </div>

      <div className="grid gap-3">
        {views.map((profileView) => (
          <Link
            key={profileView.id}
            to={getUserProfilePath(profileView.viewer)}
            className="flex items-center gap-3 rounded-2xl border border-[#e8eeff] bg-[#f7f9ff] p-3 transition hover:-translate-y-0.5 hover:border-blue/30 hover:bg-white hover:shadow-md hover:shadow-blue/10"
          >
            <UserAvatar
              avatarFallbackName={profileView.viewer.username}
              color="#2D46B9"
              userId={String(profileView.viewer.id)}
              className="h-12 w-12 shrink-0 rounded-full"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-gray-950">@{profileView.viewer.username}</p>
              {(profileView.viewer.firstName || profileView.viewer.lastName) && (
                <p className="truncate text-sm text-gray-600">
                  {[profileView.viewer.firstName, profileView.viewer.lastName]
                    .filter(Boolean)
                    .join(' ')}
                </p>
              )}
            </div>
            <RecordCreatedAt createdAt={profileView.createdAt} className="shrink-0 text-right" />
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-5 flex items-center justify-center" aria-label="Paginacija pregleda">
          <div className="flex items-center gap-2 rounded-full border border-[#dce4ff] bg-white p-1.5 shadow-sm">
            <button
              type="button"
              className="profile-views-pagination-button grid h-10 w-10 place-items-center rounded-full bg-[#f7f9ff] text-blue-dark transition-colors hover:bg-blue hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
              disabled={page === 1}
              aria-label="Prethodna stranica pregleda"
            >
              <BiChevronLeft fontSize={24} />
            </button>
            <span className="min-w-20 px-3 text-center text-sm font-semibold text-gray-700">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="profile-views-pagination-button grid h-10 w-10 place-items-center rounded-full bg-blue text-white shadow-sm shadow-blue/20 transition-colors hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
              onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
              disabled={page === totalPages}
              aria-label="Sljedeća stranica pregleda"
            >
              <BiChevronRight fontSize={24} />
            </button>
          </div>
        </nav>
      )}
    </section>
  );
};

export default ProfileViews;
