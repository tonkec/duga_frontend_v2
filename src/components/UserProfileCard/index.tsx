import Card from '@app/components/Card';
import { BiBody, BiBoltCircle, BiCheckCircle, BiSolidMap, BiStopwatch, BiX } from 'react-icons/bi';
import {
  getFavoriteDayOfWeekTranslation,
  getLookingForTranslation,
  getRelationshipStatusTranslation,
  shouldRenderField,
} from './utils';
import { IImage } from '@app/components/Photos';
import Loader from '@app/components/Loader';
import { useSocket } from '@app/context/useSocket';
import { useEffect, useState } from 'react';
import UserAvatar from '../UserAvatar';
import ContentFormatter from '../ContentFormatter';
import { cityOptions } from '@app/consts/cityOptions';
import { getImdbTitleId, getImdbTitleUrl } from '@app/utils/imdb';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '@app/utils/youtube';
import { useQuery } from '@tanstack/react-query';
import { searchImdbTitles } from '@app/api/imdb';
import Image from '../Image';

const hasEmbeddableContent = (value: string) =>
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/.test(value) ||
  /(?:https?:\/\/)?(?:(?:www\.)?giphy\.com\/(?:gifs|embed)\/[\w-]+|media[0-9]?\.giphy\.com\/media\/[\w-]+\/giphy\.gif)/.test(
    value
  ) ||
  /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i.test(value);

export interface IUserProfileCardProps {
  bio: string;
  sexuality: string;
  gender: string;
  location: string;
  age: number;
  username: string;
  lookingFor: string;
  relationshipStatus: string;
  cigarettes: boolean;
  alcohol: boolean;
  sport: boolean;
  favoriteDay: string;
  spirituality: string;
  embarasement: string;
  tooOldFor: string;
  makesMyDay: string;
  favoriteSong: string;
  favoriteMovie: string;
  interests: string;
  languages: string;
  ending: string;
  firstName: string;
  lastName: string;
  favoriteDayOfWeek: string;
  id: string;
  status: string;
}

const ProfileDetail = ({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-[#dce4ff] bg-white px-4 py-3 shadow-sm">
    <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
      {icon}
      {label}
    </p>
    <div className="text-base font-semibold text-gray-900">{value}</div>
  </div>
);

const BooleanDetail = ({
  negativeLabel,
  positiveLabel,
  value,
}: {
  negativeLabel: string;
  positiveLabel: string;
  value: boolean;
}) => (
  <div
    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
      value
        ? 'bg-green/10 text-green'
        : 'bg-red/10 text-red line-through decoration-red/70 decoration-2'
    }`}
  >
    {value ? <BiCheckCircle fontSize={20} /> : <BiX fontSize={20} />}
    <span>{value ? positiveLabel : negativeLabel}</span>
  </div>
);

const ProfileSection = ({
  title,
  children,
  compact = false,
}: {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}) => (
  <section
    className={`rounded-2xl border border-[#dce4ff] bg-white p-5 shadow-sm ${
      compact ? 'max-w-full' : ''
    }`}
  >
    <h2 className="mb-3 font-bold text-gray-900">{title}</h2>
    <div className="w-full text-gray-700">{children}</div>
  </section>
);

const hasDisplayValue = (value: string | number | null | undefined) =>
  value !== undefined && value !== null && String(value).trim() !== '' && String(value) !== 'N/A';

const UserProfileCard = ({
  user,
  allImagesLoading,
}: {
  user?: IUserProfileCardProps;
  allImages?: IImage[];
  allImagesLoading: boolean;
}) => {
  const [isOnlineState, setIsOnlineState] = useState<boolean>(false);
  const socket = useSocket();
  useEffect(() => {
    if (!socket || !user?.id) return;

    socket.on('status-update', (data) => {
      if (Number(data.userId) === Number(user.id)) {
        setIsOnlineState(data.status === 'online');
      }
    });

    return () => {
      socket.off('status-update');
    };
  }, [socket, user?.id]);

  useEffect(() => {
    if (socket && user?.id) {
      setIsOnlineState(user.status === 'online');
    }
  }, [socket, user?.id, user?.status]);

  const favoriteMovieId = getImdbTitleId(user?.favoriteMovie);
  const { data: imdbPreviewResults = [], isPending: isImdbPreviewLoading } = useQuery({
    queryKey: ['imdbTitlePreview', favoriteMovieId],
    queryFn: () => searchImdbTitles(favoriteMovieId || ''),
    enabled: Boolean(favoriteMovieId),
    retry: false,
    staleTime: 1000 * 60 * 60,
  });
  const favoriteMoviePreview =
    imdbPreviewResults.find((movie) => movie.id === favoriteMovieId) || imdbPreviewResults[0];

  if (allImagesLoading) {
    return <Loader />;
  }

  if (!user) {
    return <Card className="rounded-2xl p-6">Profil nije dostupan.</Card>;
  }

  const locationLabel =
    cityOptions.find((cityOption) => cityOption.value === user.location)?.label || 'N/A';
  const lookingForLabel = getLookingForTranslation(user.lookingFor);
  const relationshipStatusLabel = getRelationshipStatusTranslation(user.relationshipStatus);
  const profileSummary = [
    hasDisplayValue(locationLabel) ? locationLabel : null,
    hasDisplayValue(user.age) ? `${user.age} godina` : null,
  ].filter(Boolean);
  const primaryDetails = [
    {
      icon: <BiSolidMap />,
      label: 'Lokacija',
      value: locationLabel,
      shouldRender: hasDisplayValue(locationLabel),
    },
    {
      icon: <BiBody />,
      label: 'Rod',
      value: user.gender,
      shouldRender: hasDisplayValue(user.gender),
    },
    {
      icon: <BiBoltCircle />,
      label: 'Seksualnost',
      value: user.sexuality,
      shouldRender: hasDisplayValue(user.sexuality),
    },
    {
      icon: <BiStopwatch />,
      label: 'Godine',
      value: user.age,
      shouldRender: hasDisplayValue(user.age),
    },
  ].filter((detail) => detail.shouldRender);
  const relationshipDetails = [
    {
      label: 'Tražim',
      value: lookingForLabel,
      shouldRender: hasDisplayValue(lookingForLabel),
    },
    {
      label: 'Trenutno sam',
      value: relationshipStatusLabel,
      shouldRender: hasDisplayValue(relationshipStatusLabel),
    },
  ].filter((detail) => detail.shouldRender);
  const favoriteSongEmbedUrl = getYouTubeEmbedUrl(user.favoriteSong);
  const favoriteMovieUrl = getImdbTitleUrl(user.favoriteMovie);

  return (
    <Card className="rounded-2xl p-5 md:p-7">
      <div className="rounded-2xl bg-[#f7f9ff] p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <UserAvatar
            avatarFallbackName={`${user.username}`}
            color="#2D46B9"
            userId={user.id}
            size="160"
            round={false}
            className="h-[160px] w-[160px] rounded-2xl shadow-sm"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-3xl font-bold text-gray-900">{user.username}</h1>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-700 shadow-sm">
                {isOnlineState ? 'Online' : 'Offline'}
              </span>
            </div>
            {profileSummary.length > 0 && (
              <p className="mt-2 text-gray-600">{profileSummary.join(', ')}</p>
            )}
            {shouldRenderField(user.bio) && (
              <div className="mt-4 max-w-3xl text-gray-700">
                <ContentFormatter text={user.bio} />
              </div>
            )}
          </div>
        </div>

        {primaryDetails.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {primaryDetails.map((detail) => (
              <ProfileDetail
                key={detail.label}
                icon={detail.icon}
                label={detail.label}
                value={detail.value}
              />
            ))}
          </div>
        )}

        {relationshipDetails.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {relationshipDetails.map((detail) => (
              <ProfileDetail key={detail.label} label={detail.label} value={detail.value} />
            ))}
          </div>
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <BooleanDetail negativeLabel="Ne puši" positiveLabel="Puši" value={user.cigarettes} />
          <BooleanDetail negativeLabel="Ne pije" positiveLabel="Pije" value={user.alcohol} />
          <BooleanDetail
            negativeLabel="Ne bavi se sportom"
            positiveLabel="Bavi se sportom"
            value={user.sport}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {shouldRenderField(user.favoriteDayOfWeek) && (
          <ProfileSection title="Najdraži dan u tjednu">
            {getFavoriteDayOfWeekTranslation(user.favoriteDayOfWeek)}
          </ProfileSection>
        )}

        {shouldRenderField(user.embarasement) && (
          <ProfileSection
            title="Najsramotnija stvar koja mi se dogodila"
            compact={hasEmbeddableContent(user.embarasement)}
          >
            <ContentFormatter text={user.embarasement} />
          </ProfileSection>
        )}

        {shouldRenderField(user.tooOldFor) && (
          <ProfileSection
            title="Imam previše godina za..."
            compact={hasEmbeddableContent(user.tooOldFor)}
          >
            <ContentFormatter text={user.tooOldFor} />
          </ProfileSection>
        )}

        {shouldRenderField(user.makesMyDay) && (
          <ProfileSection
            title="Dan mi je ljepši ako..."
            compact={hasEmbeddableContent(user.makesMyDay)}
          >
            <ContentFormatter text={user.makesMyDay} />
          </ProfileSection>
        )}

        {shouldRenderField(user.spirituality) && (
          <ProfileSection
            title="Duhovnost/religioznost"
            compact={hasEmbeddableContent(user.spirituality)}
          >
            <ContentFormatter text={user.spirituality} />
          </ProfileSection>
        )}

        {shouldRenderField(user.interests) && (
          <ProfileSection title="Interesi" compact={hasEmbeddableContent(user.interests)}>
            <ContentFormatter text={user.interests} />
          </ProfileSection>
        )}

        {shouldRenderField(user.languages) && (
          <ProfileSection
            title="Jezici koje govorim"
            compact={hasEmbeddableContent(user.languages)}
          >
            <ContentFormatter text={user.languages} />
          </ProfileSection>
        )}

        {shouldRenderField(user.favoriteSong) && (
          <ProfileSection title="Najdraža YouTube pjesma" compact>
            {isYouTubeUrl(user.favoriteSong) && favoriteSongEmbedUrl ? (
              <iframe
                src={favoriteSongEmbedUrl}
                className="aspect-video w-full rounded-xl"
                title="Najdraža YouTube pjesma"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <p className="text-red-500">Neispravan YouTube URL</p>
            )}
          </ProfileSection>
        )}

        {shouldRenderField(user.favoriteMovie) && (
          <ProfileSection title="Najdraži film" compact>
            {favoriteMovieUrl ? (
              <a
                href={favoriteMovieUrl}
                target="_blank"
                rel="noreferrer"
                className="group grid w-full overflow-hidden rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue/10 sm:grid-cols-2"
              >
                <span className="flex min-h-[260px] w-full items-center justify-center bg-[#f5c518] text-xl font-black tracking-tight text-black">
                  {favoriteMoviePreview?.imageUrl ? (
                    <Image
                      src={favoriteMoviePreview.imageUrl}
                      alt={favoriteMoviePreview.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    'IMDb'
                  )}
                </span>
                <span className="flex min-w-0 flex-col justify-center p-5 sm:p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    IMDb preview
                  </span>
                  <span className="mt-1 font-bold text-gray-950 group-hover:text-blue">
                    {isImdbPreviewLoading
                      ? 'Učitavam film...'
                      : favoriteMoviePreview?.title || 'Otvori najdraži film'}
                  </span>
                  {favoriteMoviePreview?.year && (
                    <span className="mt-1 text-sm font-semibold text-gray-500">
                      {favoriteMoviePreview.year}
                    </span>
                  )}
                  {!favoriteMoviePreview?.year && favoriteMovieId && (
                    <span className="mt-1 text-sm font-semibold text-gray-500">
                      {favoriteMovieId}
                    </span>
                  )}
                  <span className="mt-3 inline-flex w-fit rounded-md bg-[#f5c518] px-2 py-1 text-xs font-black text-black">
                    IMDb
                  </span>
                </span>
              </a>
            ) : (
              <p className="text-red-500">Neispravan IMDb film</p>
            )}
          </ProfileSection>
        )}

        {shouldRenderField(user.ending) && (
          <ProfileSection title="Za kraj ću reći još" compact={hasEmbeddableContent(user.ending)}>
            <ContentFormatter text={user.ending} />
          </ProfileSection>
        )}
      </div>
    </Card>
  );
};

export default UserProfileCard;
