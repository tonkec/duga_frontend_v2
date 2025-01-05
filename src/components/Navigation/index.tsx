import { useLocalStorage } from '@uidotdev/usehooks';
import { Link, useNavigate } from 'react-router';
import { BiGroup, BiExit, BiEnvelope } from 'react-icons/bi';
import ProfilePhoto from '../ProfilePhoto';
import { useGetAllImages } from '../../hooks/useGetAllImages';
import { getProfilePhoto, getProfilePhotoUrl } from '../../utils/getProfilePhoto';
import { useCookies } from 'react-cookie';

const navigationStyles = 'flex space-x-4 bg-black p-4 shadow-sm text-white';

const Navigation = () => {
  const navigate = useNavigate();
  const [, setCookie] = useCookies(['token']);
  const [userId, saveUserId] = useLocalStorage('userId', null);
  const { allImages } = useGetAllImages(String(userId) || '');

  const onLogout = () => {
    setCookie('token', '');
    saveUserId(null);
    navigate('/login');
  };

  return (
    <nav className={navigationStyles}>
      <ul className="flex w-full gap-2 space-x-4 items-center">
        <li>
          <Link to="/chat" className="flex items-center gap-1">
            Poruke
            <BiEnvelope fontSize={25} />
          </Link>
        </li>
        <li>
          <Link to="/" className="flex items-center gap-1">
            Korisnici
            <BiGroup fontSize={25} />
          </Link>
        </li>
        <li>
          <span className="cursor-pointer flex items-center gap-1" onClick={onLogout}>
            Odjava <BiExit fontSize={25} />
          </span>
        </li>
      </ul>
      <div className="float-right">
        <ProfilePhoto url={getProfilePhotoUrl(getProfilePhoto(allImages?.data.images))} />
      </div>
    </nav>
  );
};

export default Navigation;
