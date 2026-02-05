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

const UserProfileCard = ({
  user,
  allImagesLoading,
}: {
  user: IUserProfileCardProps;
  allImages: IImage[];
  allImagesLoading: boolean;
}) => {
  const [isOnlineState, setIsOnlineState] = useState<boolean>(false);
  const socket = useSocket();
  useEffect(() => {
    if (!socket || !user.id) return;

    socket.on('status-update', (data) => {
      if (Number(data.userId) === Number(user.id)) {
        setIsOnlineState(data.status === 'online');
      }
    });

    return () => {
      socket.off('status-update');
    };
  }, [socket, user.id]);

  useEffect(() => {
    if (socket && user.id) {
      setIsOnlineState(user.status === 'online');
    }
  }, [socket, user.id, user.status]);

  if (allImagesLoading) {
    return <Loader />;
  }

  return (
    <Card>
      <div className="xl:flex gap-6">
        <div>
          <UserAvatar
            avatarFallbackName={`${user.username}`}
            color="#F037A5"
            userId={user.id}
            size="200"
            round={false}
            className="w-[200px] rounded"
          />
        </div>

        <div className="flex gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 mb-4">
              <h1>{user.username}</h1>
              <span className="text-xs mt-1">{isOnlineState ? '🟢' : '🔴'}</span>
            </div>
            <p className="flex items-center text-lg gap-2">
              <BiSolidMap /> <b>Lokacija: </b>{' '}
              {cityOptions.find((cityOption) => cityOption.value === user.location)?.label || 'N/A'}
            </p>
            <p className="flex items-center text-lg gap-2">
              <BiBody /> <b>Rod: </b> {user.gender || 'N/A'}
            </p>
            <p className="flex items-center text-lg gap-2">
              <BiBoltCircle /> <b>Seksualnost: </b> {user.sexuality || 'N/A'}
            </p>
            <p className="flex items-center text-lg gap-2">
              <BiStopwatch /> <b>Godine: </b> {user.age || 'N/A'}
            </p>
          </div>

          <div className="flex flex-col gap-2 mt-8">
            <p className="flex items-center text-lg gap-2 mt-[-8px]">
              <b>Tražim:</b> {getLookingForTranslation(user.lookingFor)}
            </p>
            <p className="flex items-center text-lg gap-2">
              <b>Trenutno sam: </b> {getRelationshipStatusTranslation(user.relationshipStatus)}
            </p>
            <div className="flex flex-col gap-1">
              <p className="flex items-center text-lg gap-1">
                <b>Cigarete</b>{' '}
                {user.cigarettes ? (
                  <BiCheckCircle fontSize={30} color="#34D399" />
                ) : (
                  <BiX fontSize={30} color="#FF748B" />
                )}
              </p>
              <p className="flex items-center text-lg gap-1">
                <b>Alkohol</b>{' '}
                {user.alcohol ? (
                  <BiCheckCircle fontSize={30} color="#34D399" />
                ) : (
                  <BiX fontSize={30} color="#FF748B" />
                )}
              </p>

              <p className="flex items-center text-lg gap-1">
                <b>Sport</b>{' '}
                {user.sport ? (
                  <BiCheckCircle fontSize={30} color="#34D399" />
                ) : (
                  <BiX fontSize={30} color="#FF748B" />
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {shouldRenderField(user.bio) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">O meni</h2>
          <ContentFormatter text={user.bio} />
        </div>
      )}

      {shouldRenderField(user.favoriteDayOfWeek) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Najdraži dan u tjednu:</h2>
          {getFavoriteDayOfWeekTranslation(user.favoriteDayOfWeek)}
        </div>
      )}

      {shouldRenderField(user.embarasement) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Najsramotnija stvar koja mi se dogodila</h2>
          <ContentFormatter text={user.embarasement} />
        </div>
      )}

      {shouldRenderField(user.tooOldFor) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Imam previše godina za...</h2>
          <ContentFormatter text={user.tooOldFor} />
        </div>
      )}

      {shouldRenderField(user.makesMyDay) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Dan mi je ljepši ako...</h2>
          <ContentFormatter text={user.makesMyDay} />
        </div>
      )}

      {shouldRenderField(user.spirituality) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Duhovnost/religioznost</h2>
          <ContentFormatter text={user.spirituality} />
        </div>
      )}

      {shouldRenderField(user.interests) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Interesi:</h2>
          <ContentFormatter text={user.interests} />
        </div>
      )}

      {shouldRenderField(user.languages) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Jezici koje govorim: </h2>
          <ContentFormatter text={user.languages} />
        </div>
      )}

      {shouldRenderField(user.favoriteSong) && (
        <div className="mb-10">
          <h2 className="font-bold mb-5">Najdraža youtube pjesma</h2>
          {isYouTubeUrl(user.favoriteSong) ? (
            <Iframe url={user.favoriteSong} width="600" height="400" />
          ) : (
            <p className="text-red-500">Neispravan YouTube URL</p>
          )}
        </div>
      )}

      {shouldRenderField(user.favoriteMovie) && (
        <div className="mb-10">
          <h2 className="font-bold mb-5">Najdraža youtube pjesma</h2>
          {isYouTubeUrl(user.favoriteMovie) ? (
            <Iframe url={user.favoriteMovie} width="600" height="400" />
          ) : (
            <p className="text-red-500">Neispravan YouTube URL</p>
          )}
        </div>
      )}

      {shouldRenderField(user.ending) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Za kraj ću reći još</h2>
          <ContentFormatter text={user.ending} />
        </div>
      )}
    </Card>
  );
};

export default UserProfileCard;
