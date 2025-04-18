import { useLocalStorage } from '@uidotdev/usehooks';
import { Link } from 'react-router';
import { BiExit } from 'react-icons/bi';
import ProfilePhoto from '@app/components/ProfilePhoto';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import { getProfilePhoto, getProfilePhotoUrl } from '@app/utils/getProfilePhoto';
import { useCookies } from 'react-cookie';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Loader from '@app/components/Loader';
import { useAuth0 } from '@auth0/auth0-react';
import NotificationDropdown from './components/Notifications';
import OnlineStatus from './components/OnlineStatus';

const navigationStyles = 'flex space-x-4 gradient p-4 shadow-sm text-white';

const Navigation = () => {
  const { logout } = useAuth0();
  const [, setCookie] = useCookies(['token']);
  const [userId, saveUserId] = useLocalStorage('userId', null);
  const { allImages } = useGetAllImages(String(userId) || '');
  const { user: currentUser, isUserLoading } = useGetUserById(userId || '');

  const onLogout = () => {
    setCookie('token', '');
    saveUserId(null);
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  const currentUserProfilePhoto = getProfilePhoto(allImages?.data.images);

  if (isUserLoading) return <Loader />;

  return (
    <nav className={navigationStyles}>
      <ul className="flex w-full gap-2 space-x-4 items-center">
        <li>
          <ProfilePhoto
            currentUser={currentUser?.data}
            url={getProfilePhotoUrl(currentUserProfilePhoto)}
          />
        </li>
        <NotificationDropdown userId={userId} />
        <li>
          <Link to="/" className="flex items-center gap-1">
            <span>Početna</span>
            {String.fromCodePoint(parseInt('1F3D8', 16))}
          </Link>
        </li>
        <li>
          <Link to="/new-chat" className="flex items-center gap-2">
            <span>Poruke</span>
            {String.fromCodePoint(parseInt('1F4EB', 16))}
          </Link>
        </li>
        <li>
          <Link to="/profile" className="flex items-center gap-1">
            <span>Profil</span>
            {String.fromCodePoint(parseInt('1F9D1', 16))}
          </Link>
        </li>
        {userId && <OnlineStatus userId={Number(userId)} />}
      </ul>
      <div className="float-right mt-2">
        <span className="cursor-pointer flex items-center gap-1" onClick={onLogout}>
          <BiExit fontSize={25} />
        </span>
      </div>
    </nav>
  );
};

export default Navigation;
