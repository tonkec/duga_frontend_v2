import { useLocalStorage } from '@uidotdev/usehooks';
import { Link, useNavigate } from 'react-router';
import { BiGroup, BiExit, BiEnvelope, BiUser } from 'react-icons/bi';
import ProfilePhoto from '../ProfilePhoto';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import { getProfilePhoto, getProfilePhotoUrl } from '../../utils/getProfilePhoto';
import { useCookies } from 'react-cookie';
import { useGetUserById } from '../../hooks/useGetUserById';
import Loader from '../Loader';

const navigationStyles = 'flex space-x-4 gradient p-4 shadow-sm text-white';

const Navigation = () => {
  const navigate = useNavigate();
  const [, setCookie] = useCookies(['token']);
  const [userId, saveUserId] = useLocalStorage('userId', null);
  const { allImages } = useGetAllImages(String(userId) || '');
  const { user: currentUser, isUserLoading } = useGetUserById(userId || '');

  const onLogout = () => {
    setCookie('token', '');
    saveUserId(null);
    navigate('/login');
  };

  const currentUserProfilePhoto = getProfilePhoto(allImages?.data.images);

  if (isUserLoading) return <Loader />;

  return (
    <nav className={navigationStyles}>
      <ul className="flex w-full gap-2 space-x-4 items-center">
        <li>
          <Link to="/" className="flex items-center gap-1">
            Korisnici
            <BiGroup fontSize={25} />
          </Link>
        </li>
        <li>
          <Link to="/new-chat" className="flex items-center gap-1">
            Poruke
            <BiEnvelope fontSize={25} />
          </Link>
        </li>
        <li>
          <Link to="/profile" className="flex items-center gap-1">
            Profil
            <BiUser fontSize={25} />
          </Link>
        </li>
        <li>
          <span className="cursor-pointer flex items-center gap-1" onClick={onLogout}>
            Odjava <BiExit fontSize={25} />
          </span>
        </li>
      </ul>
      {currentUser && (
        <div className="float-right">
          <ProfilePhoto
            currentUser={currentUser?.data}
            url={getProfilePhotoUrl(currentUserProfilePhoto)}
          />
        </div>
      )}
    </nav>
  );
};

export default Navigation;
