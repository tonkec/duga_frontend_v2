import Card from '@app/components/Card';
import { BiBody, BiBoltCircle, BiCheckCircle, BiSolidMap, BiStopwatch, BiX } from 'react-icons/bi';
import {
  getFavoriteDayOfWeekTranslation,
  getLookingForTranslation,
  getRelationshipStatusTranslation,
  shouldRenderField,
} from './utils';
import Iframe from 'react-iframe';
import { IImage } from '@app/components/Photos';
import Loader from '@app/components/Loader';
import { useSocket } from '@app/context/useSocket';
import { useEffect, useState } from 'react';
import UserAvatar from '../UserAvatar';
import ContentFormatter from '../ContentFormatter';
import { cityOptions } from '@app/consts/cityOptions';

const isYouTubeUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'www.youtube.com' ||
      parsed.hostname === 'youtube.com' ||
      parsed.hostname === 'youtu.be'
    );
  } catch {
    return false;
  }
};

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

const BooleanDetail = ({ label, value }: { label: string; value: boolean }) => (
  <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-800">
    <span>{label}</span>
    {value ? (
      <BiCheckCircle fontSize={24} color="#34D399" />
    ) : (
      <BiX fontSize={24} color="#FF748B" />
    )}
  </div>
);

const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-[#dce4ff] bg-white p-5 shadow-sm">
    <h2 className="mb-3 font-bold text-gray-900">{title}</h2>
    <div className="text-gray-700">{children}</div>
  </section>
);

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

  if (allImagesLoading) {
    return <Loader />;
  }

  if (!user) {
    return <Card className="rounded-2xl p-6">Profil nije dostupan.</Card>;
  }

  const locationLabel =
    cityOptions.find((cityOption) => cityOption.value === user.location)?.label || 'N/A';

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
            <p className="mt-2 text-gray-600">
              {locationLabel} {user.age ? `, ${user.age} godina` : ''}
            </p>
            {shouldRenderField(user.bio) && (
              <div className="mt-4 max-w-3xl text-gray-700">
                <ContentFormatter text={user.bio} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ProfileDetail icon={<BiSolidMap />} label="Lokacija" value={locationLabel} />
          <ProfileDetail icon={<BiBody />} label="Rod" value={user.gender || 'N/A'} />
          <ProfileDetail
            icon={<BiBoltCircle />}
            label="Seksualnost"
            value={user.sexuality || 'N/A'}
          />
          <ProfileDetail icon={<BiStopwatch />} label="Godine" value={user.age || 'N/A'} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ProfileDetail label="Tražim" value={getLookingForTranslation(user.lookingFor)} />
          <ProfileDetail
            label="Trenutno sam"
            value={getRelationshipStatusTranslation(user.relationshipStatus)}
          />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <BooleanDetail label="Cigarete" value={user.cigarettes} />
          <BooleanDetail label="Alkohol" value={user.alcohol} />
          <BooleanDetail label="Sport" value={user.sport} />
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {shouldRenderField(user.favoriteDayOfWeek) && (
          <ProfileSection title="Najdraži dan u tjednu">
            {getFavoriteDayOfWeekTranslation(user.favoriteDayOfWeek)}
          </ProfileSection>
        )}

        {shouldRenderField(user.embarasement) && (
          <ProfileSection title="Najsramotnija stvar koja mi se dogodila">
            <ContentFormatter text={user.embarasement} />
          </ProfileSection>
        )}

        {shouldRenderField(user.tooOldFor) && (
          <ProfileSection title="Imam previše godina za...">
            <ContentFormatter text={user.tooOldFor} />
          </ProfileSection>
        )}

        {shouldRenderField(user.makesMyDay) && (
          <ProfileSection title="Dan mi je ljepši ako...">
            <ContentFormatter text={user.makesMyDay} />
          </ProfileSection>
        )}

        {shouldRenderField(user.spirituality) && (
          <ProfileSection title="Duhovnost/religioznost">
            <ContentFormatter text={user.spirituality} />
          </ProfileSection>
        )}

        {shouldRenderField(user.interests) && (
          <ProfileSection title="Interesi">
            <ContentFormatter text={user.interests} />
          </ProfileSection>
        )}

        {shouldRenderField(user.languages) && (
          <ProfileSection title="Jezici koje govorim">
            <ContentFormatter text={user.languages} />
          </ProfileSection>
        )}

        {shouldRenderField(user.favoriteSong) && (
          <ProfileSection title="Najdraža YouTube pjesma">
            {isYouTubeUrl(user.favoriteSong) ? (
              <Iframe url={user.favoriteSong} width="100%" height="360" />
            ) : (
              <p className="text-red-500">Neispravan YouTube URL</p>
            )}
          </ProfileSection>
        )}

        {shouldRenderField(user.favoriteMovie) && (
          <ProfileSection title="Najdraži YouTube video">
            {isYouTubeUrl(user.favoriteMovie) ? (
              <Iframe url={user.favoriteMovie} width="100%" height="360" />
            ) : (
              <p className="text-red-500">Neispravan YouTube URL</p>
            )}
          </ProfileSection>
        )}

        {shouldRenderField(user.ending) && (
          <ProfileSection title="Za kraj ću reći još">
            <ContentFormatter text={user.ending} />
          </ProfileSection>
        )}
      </div>
    </Card>
  );
};

export default UserProfileCard;
