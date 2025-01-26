import Card from '../Card';
import { getProfilePhoto, getProfilePhotoUrl } from '../../utils/getProfilePhoto';
import Avatar from 'react-avatar';
import { BiBody, BiBoltCircle, BiCheckCircle, BiSolidMap, BiStopwatch, BiX } from 'react-icons/bi';
import {
  getFavoriteDayOfWeekTranslation,
  getLookingForTranslation,
  getRelationshipStatusTranslation,
  getUserBio,
  shouldRenderField,
} from './utils';
import Iframe from 'react-iframe';
import { IImage } from '../Photos';
import Loader from '../Loader';

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
}

const UserProfileCard = ({
  user,
  allImages,
  allImagesLoading,
}: {
  user: IUserProfileCardProps;
  allImages: IImage[];
  allImagesLoading: boolean;
}) => {
  if (allImagesLoading) {
    return <Loader />;
  }

  return (
    <Card>
      <div className="xl:flex gap-6">
        <div>
          <Avatar
            name={`${user.firstName} ${user.lastName}`}
            src={getProfilePhotoUrl(getProfilePhoto(allImages))}
            size="300"
            color="#2D46B9"
            className="rounded"
          />
        </div>

        <div className="flex gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl mb-4">
              {user.firstName} {user.lastName}
            </h1>
            <p className="flex items-center text-lg gap-2">
              <BiSolidMap /> <b>Lokacija: </b> {user.location || 'N/A'}
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

            {shouldRenderField(user.favoriteDayOfWeek) && (
              <p className="flex items-center text-lg gap-2">
                <b>Najdraži dan u tjednu:</b>
                {getFavoriteDayOfWeekTranslation(user.favoriteDayOfWeek)}
              </p>
            )}
          </div>
        </div>
      </div>

      {shouldRenderField(user.bio) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">O meni</h2>
          <p>{getUserBio(user.bio)}</p>
        </div>
      )}

      {shouldRenderField(user.embarasement) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Najsramotnija stvar koja mi se dogodila</h2>
          <p>{user.embarasement}</p>
        </div>
      )}

      {shouldRenderField(user.tooOldFor) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Imam previše godina za...</h2>
          <p>{user.tooOldFor}</p>
        </div>
      )}

      {shouldRenderField(user.makesMyDay) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Dan mi je ljepši ako...</h2>
          <p>{user.makesMyDay}</p>
        </div>
      )}

      {shouldRenderField(user.spirituality) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Duhovnost/religioznost</h2>
          <p>{user.spirituality}</p>
        </div>
      )}

      {shouldRenderField(user.interests) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Interesi:</h2>
          <p>{user.interests}</p>
        </div>
      )}

      {shouldRenderField(user.languages) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Jezici koje govorim: </h2>
          <p>{user.languages}</p>
        </div>
      )}

      {shouldRenderField(user.favoriteSong) && (
        <div className="mb-10">
          <h2 className="font-bold mb-5">Najdraža youtube pjesma</h2>
          <Iframe url={user.favoriteSong} width="600" height="400" />
        </div>
      )}

      {shouldRenderField(user.favoriteMovie) && (
        <div className="mb-10">
          <h2 className="font-bold mb-5">Najdraža youtube pjesma</h2>
          <Iframe url={user.favoriteMovie} width="600" height="400" />
        </div>
      )}

      {shouldRenderField(user.ending) && (
        <div className="mb-10">
          <h2 className="font-bold mt-5">Za kraj ću reći još</h2>
          <p>{user.ending}</p>
        </div>
      )}
    </Card>
  );
};

export default UserProfileCard;
